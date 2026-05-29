import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getOrCreateSessionId, setSessionCookie } from '../../../lib/session';

// GET - Fetch user's cart
export async function GET(request: Request) {
  try {
    const sessionId = await getOrCreateSessionId(request);
    
    // Find or create cart for this session
    let cart = await prisma.cart.findFirst({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: true, // Include full product details
          },
        },
      },
    });

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await prisma.cart.create({
        data: {
          sessionId,
          customerId: null, // For now, just guest sessions
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Calculate totals
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    const response = NextResponse.json({
      cart: {
        id: cart.id,
        sessionId: cart.sessionId,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: {
            ...item.product,
            details: typeof item.product.details === 'string' 
              ? JSON.parse(item.product.details) 
              : (item.product.details || []),
          },
        })),
        itemCount,
        total,
      },
    });

    // Set session cookie
    response.headers.set('Set-Cookie', setSessionCookie(sessionId));
    return response;
  } catch (err) {
    console.error('Error fetching cart:', err);
    return NextResponse.json({ error: 'Could not fetch cart' }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(request: Request) {
  try {
    const sessionId = await getOrCreateSessionId(request);
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Verify product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock', available: product.stock },
        { status: 400 }
      );
    }

    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: { sessionId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          sessionId,
          customerId: null,
        },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: parseInt(productId),
      },
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { error: 'Insufficient stock', available: product.stock },
          { status: 400 }
        );
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity,
        },
        include: { product: true },
      });
    }

    // Fetch updated cart with all items
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    const itemCount = updatedCart!.items.reduce((sum, item) => sum + item.quantity, 0);
    const total = updatedCart!.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    const response = NextResponse.json({
      success: true,
      cart: {
        id: updatedCart!.id,
        sessionId: updatedCart!.sessionId,
        items: updatedCart!.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: {
            ...item.product,
            details: typeof item.product.details === 'string' 
              ? JSON.parse(item.product.details) 
              : (item.product.details || []),
          },
        })),
        itemCount,
        total,
      },
    });

    response.headers.set('Set-Cookie', setSessionCookie(sessionId));
    return response;
  } catch (err) {
    console.error('Error adding to cart:', err);
    return NextResponse.json({ error: 'Could not add to cart' }, { status: 500 });
  }
}

// DELETE - Clear entire cart
export async function DELETE(request: Request) {
  try {
    const sessionId = await getOrCreateSessionId(request);

    // Find cart
    const cart = await prisma.cart.findFirst({
      where: { sessionId },
    });

    if (!cart) {
      return NextResponse.json({ success: true, message: 'Cart already empty' });
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Cart cleared',
    });

    response.headers.set('Set-Cookie', setSessionCookie(sessionId));
    return response;
  } catch (err) {
    console.error('Error clearing cart:', err);
    return NextResponse.json({ error: 'Could not clear cart' }, { status: 500 });
  }
}
