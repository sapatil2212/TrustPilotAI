import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email
    await prisma.emailVerification.deleteMany({
      where: { email },
    });

    // Create new OTP record
    await prisma.emailVerification.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: 'Verify your email - TrustPilotAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">TrustPilotAI</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email</h2>
            <p style="color: #4b5563; margin-bottom: 20px;">
              Use the following OTP to complete your registration:
            </p>
            <div style="background: white; border: 2px dashed #6366f1; padding: 20px; text-align: center; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 8px;">
                ${otp}
              </span>
            </div>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
              This OTP will expire in 10 minutes.
            </p>
            <p style="color: #9ca3af; font-size: 14px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'OTP sent successfully', email },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
