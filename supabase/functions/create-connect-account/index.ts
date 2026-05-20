// ══════════════════════════════════════════════════════════════
//  Edge Function: create-connect-account
//  Crée un compte Stripe Connect Express pour un producteur
//  et retourne l'URL d'onboarding Stripe.
//
//  Secrets requis :
//    STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno&no-check";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    // ── Auth : récupère l'utilisateur depuis le JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Non authentifié");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const sbUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await sbUser.auth.getUser();
    if (userErr || !user) throw new Error("Utilisateur introuvable");

    // ── Récupère le profil producteur
    const { data: producer, error: prodErr } = await sb
      .from("producers")
      .select("id, stripe_account, email, username")
      .eq("user_id", user.id)
      .single();

    if (prodErr || !producer) throw new Error("Profil producteur introuvable");

    const { origin } = await req.json().catch(() => ({ origin: "https://mayanabeat.fr" }));
    const returnUrl = `${origin ?? "https://mayanabeat.fr"}/beatstore.html?stripe=connected`;
    const refreshUrl = `${origin ?? "https://mayanabeat.fr"}/beatstore.html?stripe=refresh`;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    let accountId = producer.stripe_account;

    // ── Crée le compte Express si pas encore existant
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: producer.email || user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          producer_id: producer.id,
          username: producer.username || "",
        },
      });

      accountId = account.id;

      // Sauvegarde l'ID compte Stripe dans la DB
      await sb
        .from("producers")
        .update({ stripe_account: accountId, stripe_verified: false })
        .eq("id", producer.id);
    }

    // ── Génère le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[create-connect-account]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
