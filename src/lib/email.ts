import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  bcc?: string;
}

export async function sendEmail({ to, subject, html, bcc }: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"TrustPilotAI" <${process.env.EMAIL_USERNAME}>`,
      to,
      bcc: bcc || process.env.EMAIL_BCC,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

export async function sendTrialExpiryEmail(email: string, name: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trial Expired</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TrustPilotAI</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your <strong>14-day free trial</strong> has ended.
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            To continue using TrustPilotAI and access all features including:
          </p>
          <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
            <li>AI-powered review responses</li>
            <li>QR code generation</li>
            <li>Review analytics</li>
            <li>Multiple business locations</li>
          </ul>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Please upgrade your plan to continue.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/pricing" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">
              Upgrade Now
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 14px; text-align: center;">
            Questions? Contact us at support@trustpilotai.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'TrustPilotAI Free Trial Ended',
    html,
  });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to TrustPilotAI</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TrustPilotAI!</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for signing up! Your <strong>14-day free trial</strong> has started.
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            With TrustPilotAI, you can:
          </p>
          <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
            <li>Generate AI-powered review responses</li>
            <li>Create QR codes for easy review collection</li>
            <li>Track review analytics</li>
            <li>Manage multiple business locations</li>
          </ul>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 14px; text-align: center;">
            Need help? Contact us at support@trustpilotai.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to TrustPilotAI - Your 14-Day Free Trial Has Started!',
    html,
  });
}
