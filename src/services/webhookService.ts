import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

export interface WebhookTriggerResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * Trigger a specific webhook by ID
 */
export async function triggerWebhook(
  webhookId: string,
  event: string,
  payload: Record<string, unknown>,
  isTest: boolean = false
): Promise<WebhookTriggerResult> {
  try {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      return { success: false, error: "Webhook not found" };
    }

    if (!webhook.isActive && !isTest) {
      return { success: false, error: "Webhook is inactive" };
    }

    // Create signature
    const timestamp = Date.now();
    const signaturePayload = `${timestamp}.${JSON.stringify(payload)}`;
    const signature = createHmac("sha256", webhook.secret)
      .update(signaturePayload)
      .digest("hex");

    // Send the webhook
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-TrustPilotAI-Signature": `t=${timestamp},v1=${signature}`,
        "X-TrustPilotAI-Event": event,
        "User-Agent": "TrustPilotAI-Webhook/1.0",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseText = await response.text().catch(() => "");

    // Log the webhook delivery
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event,
        payload: JSON.stringify(payload),
        statusCode: response.status,
        response: responseText.substring(0, 1000), // Limit response size
        success: response.ok,
        errorMessage: response.ok ? null : `HTTP ${response.status}`,
      },
    });

    // Update webhook stats
    if (!isTest) {
      if (response.ok) {
        await prisma.webhook.update({
          where: { id: webhook.id },
          data: {
            lastTriggeredAt: new Date(),
            failureCount: 0,
          },
        });
      } else {
        const newFailureCount = webhook.failureCount + 1;
        await prisma.webhook.update({
          where: { id: webhook.id },
          data: {
            lastTriggeredAt: new Date(),
            failureCount: newFailureCount,
            // Auto-disable after 10 consecutive failures
            isActive: newFailureCount >= 10 ? false : webhook.isActive,
          },
        });
      }
    }

    return {
      success: response.ok,
      statusCode: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Log the error
    try {
      await prisma.webhookLog.create({
        data: {
          webhookId,
          event,
          payload: JSON.stringify(payload),
          success: false,
          errorMessage,
        },
      });

      // Update failure count
      if (!isTest) {
        await prisma.webhook.update({
          where: { id: webhookId },
          data: {
            failureCount: { increment: 1 },
          },
        });
      }
    } catch {
      console.error("Failed to log webhook error:", error);
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Trigger all active webhooks for a user that are subscribed to an event
 */
export async function triggerWebhooksForEvent(
  userId: string,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Trigger webhooks that are subscribed to this event
    const promises = webhooks
      .filter((webhook) => {
        const events = JSON.parse(webhook.events) as string[];
        return events.includes(event);
      })
      .map((webhook) => triggerWebhook(webhook.id, event, payload));

    // Fire and forget - don't wait for all webhooks
    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error triggering webhooks for event:", error);
  }
}

/**
 * Helper functions for triggering specific events
 */
export async function triggerNewReviewWebhook(
  userId: string,
  review: {
    id: string;
    businessId: string;
    businessName: string;
    reviewerName: string;
    rating: number;
    reviewText: string | null;
    sentiment: string;
  }
): Promise<void> {
  await triggerWebhooksForEvent(userId, "NEW_REVIEW", {
    review,
  });

  // Also trigger NEGATIVE_REVIEW if applicable
  if (review.rating <= 2 || review.sentiment === "NEGATIVE") {
    await triggerWebhooksForEvent(userId, "NEGATIVE_REVIEW", {
      review,
    });
  }
}

export async function triggerReviewRepliedWebhook(
  userId: string,
  data: {
    reviewId: string;
    businessId: string;
    businessName: string;
    reviewerName: string;
    reply: string;
  }
): Promise<void> {
  await triggerWebhooksForEvent(userId, "REVIEW_REPLIED", data);
}

export async function triggerQrScanWebhook(
  userId: string,
  data: {
    businessId: string;
    businessName: string;
    sessionId: string;
  }
): Promise<void> {
  await triggerWebhooksForEvent(userId, "QR_SCAN", data);
}

export async function triggerAiReplyGeneratedWebhook(
  userId: string,
  data: {
    reviewId: string;
    businessId: string;
    businessName: string;
    reviewerName: string;
    aiReply: string;
  }
): Promise<void> {
  await triggerWebhooksForEvent(userId, "AI_REPLY_GENERATED", data);
}
