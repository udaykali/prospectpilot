import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// LemonSqueezy webhook handler for subscription lifecycle
// Set up a webhook in LemonSqueezy pointing to: https://yourdomain.com/api/webhook
// Directions: https://docs.lemonsqueezy.com/help/webhooks

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventName = body.meta?.event_name;
    const data = body.data;

    if (!eventName || !data) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const customerEmail = data.attributes?.user_email || data.attributes?.customer_email;

    if (!customerEmail) {
      return NextResponse.json({ error: 'No email in webhook' }, { status: 400 });
    }

    // Handle subscription events
    if (
      eventName === 'subscription_created' ||
      eventName === 'subscription_updated'
    ) {
      const status = data.attributes?.status;
      const isActive = status === 'active' || status === 'trialing';

      await supabase
        .from('profiles')
        .update({
          plan: isActive ? 'premium' : 'free',
          stripe_customer_id: data.attributes?.customer_id?.toString() || null,
        })
        .eq('email', customerEmail);

      // Reset credits on upgrade
      if (isActive) {
        await supabase
          .from('profiles')
          .update({ credits_remaining: 300 })
          .eq('email', customerEmail)
          .eq('plan', 'premium');
      }
    }

    // Handle subscription cancellation
    if (eventName === 'subscription_cancelled') {
      await supabase
        .from('profiles')
        .update({ plan: 'free', credits_remaining: 20 })
        .eq('email', customerEmail);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
