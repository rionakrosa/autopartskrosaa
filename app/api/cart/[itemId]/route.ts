import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getOrCreateSessionId, setSessionCookie } from '../../../../lib/session';

// PATCH - Update cart item quantity
export async function PATCH(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const sessionId = await getOrCreateSessionId(request);
    const { quantity } = await request.json();
    const itemId = parseInt(params.itemId);

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
    }

    // Find the cart item and verify it belongs to this session
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    if (cartItem.cart.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock', available: cartItem.product.stock },
        { status: 400 }
      );
    }

    // Update quantity
    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: true,
      },
    });

    const response = NextResponse.json({
      success: true,
      item: {
        id: updated.id,
        productId: updated.productId,
        quantity: updated.quantity,
        product: {
          ...updated.product,
          details: typeof updated.product.details === 'string'
            ? JSON.parse(updated.product.details)
            : (updated.product.details || []),
        },
      },
    });

    response.headers.set('Set-Cookie', setSessionCookie(sessionId));
    return response;
  } catch (err) {
    console.error('Error updating cart item:', err);
    return NextResponse.json({ error: 'Could not update cart item' }, { status: 500 });
  }
}

// DELETE - Remove cart item
export async function DELETE(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const sessionId = await getOrCreateSessionId(request);
    const itemId = parseInt(params.itemId);

    // Find the cart item and verify it belongs to this session
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    if (cartItem.cart.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });

    response.headers.set('Set-Cookie', setSessionCookie(sessionId));
    return response;
  } catch (err) {
    console.error('Error deleting cart item:', err);
    return NextResponse.json({ error: 'Could not delete cart item' }, { status: 500 });
  }
}
