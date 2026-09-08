import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceClient } from '@/lib/supabase/server';
import { emails } from '@/lib/email';
import { LEMONSQUEEZY_CONFIG } from '@/lib/lemonsqueezy';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature');
    const secret = LEMONSQUEEZY_CONFIG.webhookSecret;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      console.error('[Lemon Squeezy Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data;
    const userId = customData?.supabase_user_id;

    console.log(`[Lemon Squeezy Webhook] Received event: ${eventName} for user: ${userId}`);

    const supabase = getServiceClient();

    switch (eventName) {
      case 'order_created':
      case 'subscription_created': {
        if (userId) {
          const subscriptionId = payload.data?.id;
          const customerId = payload.data?.attributes?.customer_id;

          await supabase
            .from('profiles')
            .update({
              plan_tier: 'pro',
              stripe_customer_id: customerId ? String(customerId) : null,
              stripe_subscription_id: subscriptionId ? String(subscriptionId) : null,
            })
            .eq('id', userId);

          // Send payment confirmation email
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', userId)
              .single();

            if (profile?.email) {
              await emails.paymentSuccess(profile.email, 'Pro');
            }
          } catch (err) {
            console.error('[Lemon Squeezy Webhook] Failed to send payment email:', err);
          }

          console.log('[Lemon Squeezy Webhook] User upgraded to Pro:', userId);
        }
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        if (userId) {
          await supabase
            .from('profiles')
            .update({ plan_tier: 'free' })
            .eq('id', userId);

          console.log('[Lemon Squeezy Webhook] Subscription ended for user:', userId);
        }
        break;
      }

      default:
        console.log(`[Lemon Squeezy Webhook] Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Lemon Squeezy Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
