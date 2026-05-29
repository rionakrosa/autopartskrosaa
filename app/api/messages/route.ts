import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, content } = await req.json();
    if (!name || !email || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const message = await prisma.message.create({
      data: { name, email, subject, content }
    });
    return NextResponse.json({ success: true, message });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
