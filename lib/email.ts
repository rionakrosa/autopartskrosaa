import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail({
  name,
  email,
  message,
  attachmentPath,
}: {
  name: string;
  email: string;
  message: string;
  attachmentPath?: string | null;
}) {
  try {
    const emailContent = `
      <h2>Mesazh i ri nga kontakti</h2>
      <p><strong>Emri:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mesazhi:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      ${attachmentPath ? `<p><strong>Bashkangjitje:</strong> ${attachmentPath}</p>` : ''}
      <hr>
      <p style="color: #666; font-size: 12px;">Dërguar nga autopartskrosa.com</p>
    `;

    await resend.emails.send({
      from: 'Auto Parts Krosa <onboarding@resend.dev>', // Resend test email
      to: 'contact@autopartskrosa.com',
      replyTo: email,
      subject: `Mesazh i ri nga ${name}`,
      html: emailContent,
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
