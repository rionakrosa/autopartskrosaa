import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { sendMail } from '../../../lib/mail';
import { generateInvoicePDF } from '../../../lib/invoice';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, total } = body;

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return NextResponse.json({ error: "Missing required customer fields" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
    }

    // STEP 1: Verify stock availability for all items
    const stockChecks = await Promise.all(
      items.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, stock: true, isActive: true },
        });

        if (!product || !product.isActive) {
          return { success: false, message: `Produkti nuk ekziston ose nuk është aktiv` };
        }

        if (product.stock < item.quantity) {
          return { 
            success: false, 
            message: `"${product.name}" nuk ka stock të mjaftueshëm. Në dispozicion: ${product.stock}` 
          };
        }

        return { success: true, product };
      })
    );

    // Check if any stock validation failed
    const failedCheck = stockChecks.find(check => !check.success);
    if (failedCheck) {
      return NextResponse.json({ error: failedCheck.message }, { status: 400 });
    }

    // Find or create customer, and update name/phone if changed
    let dbCustomer = await prisma.customer.findUnique({
      where: { email: customer.email },
    });

    if (!dbCustomer) {
      dbCustomer = await prisma.customer.create({
        data: {
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
        },
      });
    } else {
      // Update name and phone if changed
      dbCustomer = await prisma.customer.update({
        where: { email: customer.email },
        data: {
          name: customer.name,
          phone: customer.phone,
        },
      });
    }

    // Generate unique order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, "0")}`;

    // STEP 2: Create order and update stock in a transaction (atomic operation)
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: dbCustomer.id,
          status: "pending",
          total,
          shippingAddress: customer.address,
          notes: customer.notes || null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.priceAtTime,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });

      // STEP 3: Decrease stock for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    // If transaction succeeds, stock is updated and order is created
    // Send email notification
    try {
      const tvshRate = 0.18;
      const subtotal = order.total / (1 + tvshRate);
      const tvshAmount = order.total - subtotal;
      const html = `
        <div style=\"font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;\">
          <div style=\"text-align: center; margin-bottom: 16px;\">
            <h2 style=\"margin: 0; color: #333;\">AUTO PARTS KROSA</h2>
            <h3 style=\"margin: 8px 0 0 0; color: #444;\">ORDER CONFIRMATION</h3>
            <p style=\"color: #008000; font-weight: bold; margin: 8px 0 0 0;\">Ne kemi pranuar një porosi të re!</p>
          </div>
          <hr style=\"margin: 16px 0;\">
          <div style=\"margin-bottom: 16px;\">
            <strong>Numri i porosisë:</strong> ${order.orderNumber}<br>
            <strong>Emri:</strong> ${order.customer.name}<br>
            <strong>Email:</strong> ${order.customer.email}<br>
            <strong>Adresa:</strong> ${order.shippingAddress}
          </div>
          <div style=\"background: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 16px;\">
            <h4 style=\"margin-top: 0; color: #555;\">Përmbledhje e Porosisë</h4>
            <ul style=\"padding-left: 18px; margin: 0;\">
              ${order.items.map((item: any) => {
                const details = item.product.details ? JSON.parse(item.product.details) : [];
                return `<li>
                  <strong>${item.product.name}</strong> x${item.quantity} (€${item.priceAtTime})<br>
                  <span style='color:#666;'>Kodi unik: <b>${item.product.sku || item.product.id}</b></span><br>
                  ${details.length > 0 ? `<span style='color:#888;'>Detaje: ${details.join(', ')}</span><br>` : ''}
                  <span style='color:#c00;'>Garancion: Pa garancion</span><br>
                </li>`;
              }).join('')}
            </ul>
            <div style=\"margin-top: 12px; font-size: 1em; color: #222;\">Nëntotali: €${subtotal.toFixed(2)}</div>
            <div style=\"margin-top: 4px; font-size: 1em; color: #222;\">TVSH (18%): €${tvshAmount.toFixed(2)}</div>
            <div style=\"margin-top: 8px; font-size: 1.1em; font-weight: bold; color: #222;\">Totali: €${order.total.toFixed(2)}</div>
          </div>
          <div style=\"text-align: center; color: #888; font-size: 0.95em; margin-top: 16px;\">Faleminderit që zgjodhët Auto Parts Krosa!</div>
        </div>
      `;
      await sendMail({
        to: process.env.EMAIL_USER,
        subject: `Porosi e re: ${order.orderNumber}`,
        html,
      });
    } catch (err) {
      console.error('Failed to send order notification email:', err);
    }

    // Send invoice PDF to customer
    try {
      const pdfBuffer = await generateInvoicePDF({
        orderNumber: order.orderNumber,
        customer: order.customer,
        shippingAddress: order.shippingAddress,
        items: order.items,
        total: order.total,
        createdAt: order.createdAt,
      });

      const customerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;">
          <div style="text-align: center; margin-bottom: 16px;">
            <h2 style="margin: 0; color: #333;">AUTO PARTS KROSA</h2>
            <h3 style="margin: 8px 0 0 0; color: #444;">KONFIRMA E POROSISË</h3>
            <p style="color: #008000; font-weight: bold; margin: 8px 0 0 0;">Porosia juaj është pranuar me sukses!</p>
          </div>
          <hr style="margin: 16px 0;">
          <div style="margin-bottom: 16px;">
            <strong>Numri i porosisë:</strong> ${order.orderNumber}<br>
            <strong>Emri:</strong> ${order.customer.name}<br>
            <strong>Email:</strong> ${order.customer.email}<br>
            <strong>Adresa:</strong> ${order.shippingAddress}
          </div>
          <div style="background: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
            <h4 style="margin-top: 0; color: #555;">Përmbledhje e Porosisë</h4>
            <ul style="padding-left: 18px; margin: 0;">
              ${order.items.map((item: any) => {
                const details = item.product.details ? JSON.parse(item.product.details) : [];
                return `<li>
                  <strong>${item.product.name}</strong> x${item.quantity} (€${item.priceAtTime})<br>
                  <span style='color:#666;'>Kodi unik: <b>${item.product.sku || item.product.id}</b></span><br>
                  ${details.length > 0 ? `<span style='color:#888;'>Detaje: ${details.join(', ')}</span><br>` : ''}
                  <span style='color:#c00;'>Garancion: Pa garancion</span><br>
                </li>`;
              }).join('')}
            </ul>
            <div style="margin-top: 12px; font-size: 1em; color: #222;">Nëntotali: €${(order.total / 1.18).toFixed(2)}</div>
            <div style="margin-top: 4px; font-size: 1em; color: #222;">TVSH (18%): €${(order.total - order.total / 1.18).toFixed(2)}</div>
            <div style="margin-top: 8px; font-size: 1.1em; font-weight: bold; color: #222;">Totali: €${order.total.toFixed(2)}</div>
          </div>
          <div style="text-align: center; color: #888; font-size: 0.95em; margin-top: 16px;">
            Fatura është bashkangjitur këtij email-i si PDF.<br>
            Faleminderit që zgjodhët Auto Parts Krosa!
          </div>
        </div>
      `;

      await sendMail({
        to: order.customer.email,
        subject: `Konfirmimi i Porosisë: ${order.orderNumber}`,
        html: customerHtml,
        attachments: [{
          filename: `Fatura-${order.orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }],
      });
    } catch (err) {
      console.error('Failed to send customer invoice email:', err);
    }
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: "Porosia u krijua me sukses dhe stock u përditësua",
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    // Transaction will automatically rollback if any error occurs
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({ select: { id: true } });
    const orderIds = orders.map((order) => order.id);

    if (orderIds.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }

    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.order.deleteMany({ where: { id: { in: orderIds } } }),
    ]);

    return NextResponse.json({ success: true, deleted: orderIds.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete orders", details: error.message },
      { status: 500 }
    );
  }
}
