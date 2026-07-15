import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      return Response.json({ error: 'Audience not configured' }, { status: 500 });
    }

    await resend.contacts.create({
      email: trimmed,
      audienceId,
      unsubscribed: false,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('[waitlist] error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
