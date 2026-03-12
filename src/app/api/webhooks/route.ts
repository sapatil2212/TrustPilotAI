import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const WEBHOOK_EVENTS = [
  "NEW_REVIEW",
  "REVIEW_REPLIED",
  "QR_SCAN",
  "NEGATIVE_REVIEW",
  "AI_REPLY_GENERATED",
];

// GET /api/webhooks - List user's webhooks
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const webhooks = await prisma.webhook.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        url: true,
        events: true,
        isActive: true,
        lastTriggeredAt: true,
        failureCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse events JSON
    const parsedWebhooks = webhooks.map((webhook) => ({
      ...webhook,
      events: JSON.parse(webhook.events),
    }));

    return NextResponse.json({ webhooks: parsedWebhooks });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}

// POST /api/webhooks - Create a webhook
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, events } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Webhook name is required" },
        { status: 400 }
      );
    }

    if (!url?.trim()) {
      return NextResponse.json(
        { error: "Webhook URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook URL" },
        { status: 400 }
      );
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "At least one event must be selected" },
        { status: 400 }
      );
    }

    // Validate events
    const invalidEvents = events.filter((e: string) => !WEBHOOK_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(", ")}` },
        { status: 400 }
      );
    }

    // Limit webhooks per user
    const existingCount = await prisma.webhook.count({
      where: { userId: session.user.id },
    });

    if (existingCount >= 10) {
      return NextResponse.json(
        { error: "Maximum of 10 webhooks allowed" },
        { status: 400 }
      );
    }

    // Generate secret for signature verification
    const secret = `whsec_${randomBytes(24).toString("hex")}`;

    // Create webhook
    const webhook = await prisma.webhook.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        url: url.trim(),
        events: JSON.stringify(events),
        secret,
      },
    });

    return NextResponse.json({
      webhook: {
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        events,
        isActive: webhook.isActive,
        secret: webhook.secret, // Only shown on creation
        createdAt: webhook.createdAt,
      },
      message: "Webhook created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating webhook:", error);
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}
