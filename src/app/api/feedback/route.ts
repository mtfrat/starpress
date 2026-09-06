import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

async function sendNegativeFeedbackAlert(
  locationName: string,
  rating: number,
  comment: string,
  contact: string,
  ownerEmail: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Feedback] RESEND_API_KEY not configured, skipping email alert");
    return;
  }

  const fromEmail = process.env.FEEDBACK_ALERT_FROM || "alerts@starpress.app";
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `StarPress Alerts <${fromEmail}>`,
        to: ownerEmail,
        subject: `⚠️ Negative feedback at ${locationName} — ${rating}/5`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⚠️ New Negative Feedback</h2>
            <p>A customer left a <strong>${rating}/5</strong> rating at <strong>${locationName}</strong>.</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 24px;">${stars}</p>
              ${comment ? `<p style="margin: 8px 0 0 0; color: #374151;">"${comment}"</p>` : ""}
              ${contact ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">Contact: ${contact}</p>` : ""}
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This feedback was captured via your Review Gating QR code.
              The customer chose not to leave a public Google review.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">StarPress — Review Management</p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error("[Feedback] Failed to send email alert:", err);
  }
}

async function dispatchWebhooks(
  supabase: ReturnType<typeof getServiceClient>,
  locationId: string,
  payload: Record<string, unknown>
) {
  const { data: webhooks } = await supabase
    .from("webhooks")
    .select("*")
    .eq("location_id", locationId)
    .eq("is_active", true);

  if (!webhooks || webhooks.length === 0) return;

  for (const webhook of webhooks) {
    try {
      const body = JSON.stringify(payload);
      const signature = await createHmacSignature(body, webhook.secret);

      await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-starpress-signature": signature,
          "x-starpress-event": payload.event_type as string,
          "x-starpress-id": payload.event_id as string,
        },
        body,
      });
    } catch (err) {
      console.error(`[Feedback] Webhook dispatch failed for ${webhook.url}:`, err);
    }
  }
}

async function createHmacSignature(body: string, secret: string): Promise<string> {
  const { createHmac } = await import("crypto");
  return createHmac("sha256", secret).update(body).digest("hex");
}

// Save feedback (public - no auth required)
export async function POST(request: Request) {
  try {
    // Rate limit: 10 per minute per IP (public endpoint)
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const { success, reset } = await checkRateLimit("feedback", ip);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const { location_id, rating, comment, contact } = await request.json();

    if (!location_id || !rating) {
      return NextResponse.json(
        { error: "location_id and rating are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Fetch location info for alerts
    const { data: location } = await supabase
      .from("locations")
      .select("name, profile_id")
      .eq("id", location_id)
      .single();

    const { error } = await supabase.from("feedback").insert({
      location_id,
      rating,
      comment: comment || null,
      contact: contact || null,
    });

    if (error) {
      console.error("Feedback insert error:", error);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    // Negative feedback (1-3 stars): send email + dispatch webhooks
    if (rating <= 3 && location) {
      // Fetch owner email
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", location.profile_id)
        .single();

      // Get email from auth.users via admin API (service role)
      if (profile) {
        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
        if (authUser?.user?.email) {
          await sendNegativeFeedbackAlert(
            location.name,
            rating,
            comment || "",
            contact || "",
            authUser.user.email
          );
        }
      }

      // Dispatch outbound webhooks
      const eventId = `evt_${crypto.randomUUID()}`;
      await dispatchWebhooks(supabase, location_id, {
        event_id: eventId,
        event_type: "feedback.received.negative",
        created_at: new Date().toISOString(),
        data: {
          feedback: {
            id: crypto.randomUUID(),
            rating,
            comment: comment || "",
            contact: contact || "",
            submitted_at: new Date().toISOString(),
          },
          location: {
            id: location_id,
            name: location.name,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get feedback for a location (authenticated - owner only)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location_id");

    if (!locationId) {
      return NextResponse.json(
        { error: "location_id is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("feedback")
      .select("id, rating, comment, contact, created_at")
      .eq("location_id", locationId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
