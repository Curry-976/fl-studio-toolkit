// ══════════════════════════════════════════════════════════════
//  Edge Function: stripe-checkout
//  Crée une Stripe Checkout Session et retourne l'URL de paiement
//
//  Secrets requis (supabase secrets set --env-file .env.local) :
//    STRIPE_SECRET_KEY=sk_live_xxx
//    SUPABASE_URL=https://fjwftrucqerwshhpmezl.supabase.co
//    SUPABASE_SERVICE_ROLE_KEY=eyJ...
// ══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno&no-check";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { beat_id, tier, buyer_email, buyer_name, origin } =
      await req.json();

    if (!beat_id || !tier || !buyer_email) {
      throw new Error("Paramètres manquants : beat_id, tier, buyer_email");
    }

    // ── Clients
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Récupère le beat + producteur
    const { data: beat, error: beatErr } = await sb
      .from("beats")
      .select("*, producers(username, stripe_account)")
      .eq("id", beat_id)
      .eq("is_active", true)
      .single();

    if (beatErr || !beat) throw new Error("Beat introuvable ou inactif");

    const PRICES: Record<string, number> = {
      lease: beat.price_lease,
      trackout: beat.price_trackout,
      exclu: beat.price_exclu,
    };
    const LABELS: Record<string, string> = {
      lease: "Lease",
      trackout: "Trackout",
      exclu: "Exclusivité",
    };

    const amount = PRICES[tier];
    if (!amount) throw new Error(`Tier invalide : ${tier}`);

    // ── Crée l'achat en "pending"
    const { data: purchase, error: purchaseErr } = await sb
      .from("purchases")
      .insert({
        beat_id,
        producer_id: beat.producer_id,
        buyer_email,
        buyer_name: buyer_name || "",
        license_tier: tier,
        amount_cents: amount,
        status: "pending",
      })
      .select()
      .single();

    if (purchaseErr) throw new Error("Erreur création achat : " + purchaseErr.message);

    // ── Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amount, // centimes
            product_data: {
              name: `${beat.title} — ${LABELS[tier]}`,
              description: `Beat par ${beat.producers?.username ?? "Producteur"} · BPM ${beat.bpm} · ${beat.key}`,
              metadata: { beat_id, tier },
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: buyer_email,
      metadata: {
        purchase_id: purchase.id,
        beat_id,
        tier,
        producer_id: beat.producer_id,
      },
      success_url: `${origin ?? "https://mayanabeat.fr"}/beatstore.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin ?? "https://mayanabeat.fr"}/beatstore.html?payment=cancel`,
      // Stripe Connect : transfert automatique vers le producteur (si connecté)
      ...(beat.producers?.stripe_account
        ? {
            payment_intent_data: {
              transfer_data: {
                destination: beat.producers.stripe_account,
                amount: Math.round(amount * 0.85), // 15% commission plateforme
              },
            },
          }
        : {}),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Sauvegarde l'ID session Stripe
    await sb
      .from("purchases")
      .update({ stripe_session_id: session.id })
      .eq("id", purchase.id);

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[stripe-checkout]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
