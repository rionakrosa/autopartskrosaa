import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { prisma } from '../../../lib/prisma'
import { verifyTokenFromHeader, unauthorized } from '../../../lib/auth'

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json')

// Read JSON file fallback
async function readJsonFile() {
  const raw = await fs.readFile(DATA_FILE, 'utf8')
  return JSON.parse(raw)
}

// Write JSON file fallback
async function writeJsonFile(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

// GET handler with filtering and search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const bestSeller = searchParams.get('bestSeller');
    const inStock = searchParams.get('inStock');
    
    // Build where clause
    const where: any = {
      isActive: true, // Only show active products
    };

    if (search) {
      // SQLite-compatible search: LIKE is case-insensitive by default
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (bestSeller === 'true') {
      where.bestSeller = true;
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    // Fetch from database
    const products = await prisma.product.findMany({
      where,
      orderBy: { id: 'asc' }
    });

    // Ensure details is parsed into an array for the client
    const normalized = products.map((p: any) => ({
      ...p,
      details: typeof p.details === 'string' ? JSON.parse(p.details) : (p.details || []),
    }));

    return NextResponse.json(normalized);
  } catch (err) {
    console.error('Error fetching products:', err);
    return NextResponse.json({ error: 'Could not fetch products' }, { status: 500 });
  }
}

// POST handler - Create single product or bulk upload
export async function POST(request: Request) {
  try {
    verifyTokenFromHeader(request);
  } catch (e) {
    return unauthorized();
  }

  const body = await request.json();

  try {
    // Bulk upload (array of products)
    if (Array.isArray(body)) {
      await prisma.$transaction([
        prisma.product.deleteMany(),
        prisma.product.createMany({
          data: body.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            description: p.description,
            details: JSON.stringify(p.details || []),
            bestSeller: Boolean(p.bestSeller),
            stock: p.stock || 0,
            category: p.category || '',
            sku: p.sku || null,
            isActive: p.isActive !== undefined ? p.isActive : true,
          })),
        }),
      ]);
      return NextResponse.json({ ok: true, message: 'Bulk upload successful' });
    }

    // Single product creation
    const { name, price, image, description, details, bestSeller, stock, category } = body;

    if (!name || !price || !image) {
      return NextResponse.json({ error: 'Missing required fields: name, price, image' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        image,
        description: description || '',
        details: JSON.stringify(details || []),
        bestSeller: Boolean(bestSeller),
        stock: parseInt(stock) || 0,
        category: category || '',
        isActive: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error('Error creating product:', err);
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
  }
}



