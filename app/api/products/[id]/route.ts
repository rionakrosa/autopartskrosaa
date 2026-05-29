import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyTokenFromHeader, unauthorized } from '../../../../lib/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Normalize images field
    let images = [];
    try {
      if (Array.isArray(product.images)) {
        images = product.images;
      } else if (typeof product.images === 'string') {
        images = JSON.parse(product.images || '[]');
      }
    } catch {
      images = [];
    }
    // Prepend '/' to image paths if missing
    images = images.map((img: string) => img.startsWith('/') ? img : '/' + img);

    const normalized = {
      ...product,
      details: typeof product.details === 'string' ? JSON.parse(product.details) : (product.details || []),
      images
    };

    return NextResponse.json(normalized);
  } catch (err) {
    console.error('Error fetching product:', err);
    return NextResponse.json({ error: 'Could not read product' }, { status: 500 });
  }
}

// PATCH - Update product (partial update)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    verifyTokenFromHeader(request);
  } catch (e) {
    return unauthorized();
  }

  const id = Number(params.id);
  const body = await request.json();

  try {
    // Build update data object (only include provided fields)
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.images !== undefined) updateData.images = body.images;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.details !== undefined) updateData.details = JSON.stringify(body.details);
    if (body.bestSeller !== undefined) updateData.bestSeller = Boolean(body.bestSeller);
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    const normalized = {
      ...updated,
      details: typeof updated.details === 'string' ? JSON.parse(updated.details) : (updated.details || [])
    };

    return NextResponse.json(normalized);
  } catch (err) {
    console.error('Error updating product:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// PUT - Full replacement (backward compatibility)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    verifyTokenFromHeader(request);
  } catch (e) {
    return unauthorized();
  }

  const id = Number(params.id);
  const body = await request.json();

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        price: parseFloat(body.price),
        images: body.images,
        description: body.description,
        details: JSON.stringify(body.details || []),
        bestSeller: Boolean(body.bestSeller),
        stock: body.stock !== undefined ? parseInt(body.stock) : 0,
        category: body.category || '',
      }
    });

    const normalized = {
      ...updated,
      details: typeof updated.details === 'string' ? JSON.parse(updated.details) : (updated.details || [])
    };

    return NextResponse.json(normalized);
  } catch (err) {
    console.error('Error updating product:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// DELETE - Soft delete (set isActive to false)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    verifyTokenFromHeader(request);
  } catch (e) {
    return unauthorized();
  }

  const id = Number(params.id);
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get('permanent') === 'true';

  try {
    if (permanent) {
      // Hard delete
      await prisma.product.delete({ where: { id } });
      return NextResponse.json({ message: 'Product permanently deleted' });
    } else {
      // Soft delete
      const updated = await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
      return NextResponse.json({ message: 'Product deactivated', product: updated });
    }
  } catch (err) {
    console.error('Error deleting product:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
