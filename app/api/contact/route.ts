import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { sendContactEmail } from '../../../lib/email';

async function postToWebhook(payload: any) {
  const url = process.env.CONTACT_WEBHOOK_URL
  if (!url) return { ok: false, skipped: true }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return { ok: res.ok }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File | null;

    const dataDir = path.join(process.cwd(), 'data');
    const messagesFile = path.join(dataDir, 'messages.json');
    const uploadsDir = path.join(dataDir, 'uploads');

    // ensure directories exist
    try { await fs.mkdir(dataDir, { recursive: true }); } catch (e) {}
    try { await fs.mkdir(uploadsDir, { recursive: true }); } catch (e) {}

    let messages = [] as any[];
    try {
      const raw = await fs.readFile(messagesFile, 'utf8');
      messages = JSON.parse(raw || '[]');
    } catch (e) {
      messages = [];
    }

    let attachmentPath = null;
    if (file && file.size > 0) {
      // Save uploaded file
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${safeName}`;
      const filePath = path.join(uploadsDir, fileName);
      
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      attachmentPath = `uploads/${fileName}`;
    }

    const entry = { 
      name, 
      email, 
      message, 
      attachment: attachmentPath,
      createdAt: new Date().toISOString() 
    };
    messages.push(entry);
    await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2), 'utf8');

    // Send email notification
    await sendContactEmail({
      name,
      email,
      message,
      attachmentPath,
    });

    // Optional: forward to an external webhook (Discord/Slack/Zapier)
    // Set CONTACT_WEBHOOK_URL in your environment to enable this.
    await postToWebhook({ type: 'contact', entry });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
