import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckout, LEMONSQUEEZY_CONFIG } from '@/lib/lemonsqueezy';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interval = 'monthly' } = (await request.json()) as {
      interval?: 'monthly' | 'yearly';
    };

    const variantId =
      interval === 'yearly'
        ? LEMONSQUEEZY_CONFIG.variants.yearly
        : LEMONSQUEEZY_CONFIG.variants.monthly;

    if (!variantId || !LEMONSQUEEZY_CONFIG.storeId) {
      return NextResponse.json(
        { error: 'Lemon Squeezy is not fully configured (missing Variant ID or Store ID)' },
        { status: 500 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_tier')
      .eq('id', user.id)
      .single();

    if (profile?.plan_tier === 'pro') {
      return NextResponse.json(
        { error: 'You are already on the Pro plan' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkout = await createCheckout(
      LEMONSQUEEZY_CONFIG.storeId,
      variantId,
      {
        checkoutData: {
          email: user.email || undefined,
          custom: {
            supabase_user_id: user.id,
          },
        },
        productOptions: {
          redirectUrl: `${baseUrl}/dashboard?upgraded=true`,
        },
      }
    );

    const checkoutUrl = checkout.data?.data?.attributes?.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to create Lemon Squeezy checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('POST /api/lemonsqueezy/checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
