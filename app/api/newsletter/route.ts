import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const email = (body?.email || '').toString().trim();

		if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
			return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
		}

		// Minimal implementation: accept and acknowledge subscription.
		// Optional: persist to DB or forward to mailing service.
		return NextResponse.json({ success: true, email });
	} catch (err) {
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}
}

export async function GET() {
	return NextResponse.json({ message: 'Newsletter endpoint: POST with { email }' });
}
