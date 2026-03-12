import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triggerWebhook } from "@/services/webhookService";

// POST /api/webhooks/[id]/test - Test webhook
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const webhook = await prisma.webhook.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      );
    }

    // Send test payload
    const testPayload = {
      event: "TEST",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook from TrustPilotAI",
        webhookId: webhook.id,
        webhookName: webhook.name,
      },
    };

    const result = await triggerWebhook(webhook.id, "TEST", testPayload, true);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test webhook sent successfully",
        statusCode: result.statusCode,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || "Failed to deliver webhook",
        statusCode: result.statusCode,
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Error testing webhook:", error);
    return NextResponse.json(
      { error: "Failed to test webhook" },
      { status: 500 }
    );
  }
}
