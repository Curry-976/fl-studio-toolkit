// ══════════════════════════════════════════════════════════════
//  Edge Function: stripe-webhook
//  Traite les événements Stripe après paiement
//
//  Secrets requis :
//    STRIPE_SECRET_KEY=sk_live_xxx
//    STRIPE_WEBHOOK_SECRET=whsec_xxx  (depuis Stripe Dashboard > Webhooks)
//    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
//  URL du webhook à configurer dans Stripe :
//    https://fjwftrucqerwshhpmezl.supabase.co/functions/v1/stripe-webhook
//  Événements à écouter : checkout.session.completed
// ══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno&no-check";

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!sig) {
    return new Response("Signature manquante", { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
  });

  // ── Vérifie la signature Stripe
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    console.error("[stripe-webhook] Signature invalide:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ── checkout.session.completed → paiement confirmé
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { purchase_id } = session.metadata ?? {};

    if (purchase_id) {
      const { error } = await sb
        .from("purchases")
        .update({ status: "completed", stripe_session_id: session.id })
        .eq("id", purchase_id);

      if (error) {
        console.error("[stripe-webhook] Update purchase failed:", error.message);
        return new Response("DB error", { status: 500 });
      }

      console.log(`[stripe-webhook] ✅ Achat ${purchase_id} → completed`);
    }
  }

  // ── checkout.session.expired → annulé
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.id) {
      await sb
        .from("purchases")
        .update({ status: "refunded" })
        .eq("stripe_session_id", session.id)
        .eq("status", "pending");
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
