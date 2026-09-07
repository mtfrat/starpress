import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServiceClient } from "@/lib/supabase/server";
import { emails } from "@/lib/email";
import Stripe from "stripe";

// Disable body parsing — Stripe needs the raw body
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = getServiceClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (userId) {
          await supabase
            .from("profiles")
            .update({
              plan_tier: "pro",
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            })
            .eq("id", userId);

          // Send payment confirmation email
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("email")
              .eq("id", userId)
              .single();

            if (profile?.email) {
              await emails.paymentSuccess(profile.email, "Pro");
            }
          } catch {
            console.error("[Stripe Webhook] Failed to send payment email");
          }

          console.log("[Stripe Webhook] User upgraded to Pro:", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          const isActive = subscription.status === "active";
          await supabase
            .from("profiles")
            .update({
              plan_tier: isActive ? "pro" : "free",
            })
            .eq("id", userId);

          console.log(
            "[Stripe Webhook] Subscription updated:",
            userId,
            isActive ? "active" : "inactive"
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          await supabase
            .from("profiles")
            .update({ plan_tier: "free" })
            .eq("id", userId);

          console.log("[Stripe Webhook] User downgraded to Free:", userId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.parent?.subscription_details?.subscription as string;

        // Find user by subscription ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (profile) {
          // Optionally downgrade after failed payment
          console.log("[Stripe Webhook] Payment failed for user:", profile.id);
        }
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
