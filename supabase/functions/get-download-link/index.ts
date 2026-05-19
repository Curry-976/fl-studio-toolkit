// ══════════════════════════════════════════════════════════════
//  Edge Function: get-download-link
//  Régénère un lien de téléchargement signé pour un achat
//
//  Auth requise : JWT de l'acheteur (via OTP email)
//  Le buyer_email de l'achat doit correspondre à l'email du JWT.
//
//  Secrets requis (auto-injectés) :
//    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ══════════════════════════════════════════════════════════════

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    // ── Vérifie l'auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401, headers: CORS });
    }
    const jwt = authHeader.slice(7);

    const sbAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Récupère l'utilisateur depuis le JWT
    const { data: { user }, error: userErr } = await sbAdmin.auth.getUser(jwt);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Token invalide ou expiré" }), { status: 401, headers: CORS });
    }

    const { purchase_id } = await req.json();
    if (!purchase_id) {
      return new Response(JSON.stringify({ error: "purchase_id manquant" }), { status: 400, headers: CORS });
    }

    // ── Récupère l'achat — vérifie que l'email correspond
    const { data: purchase, error: pErr } = await sbAdmin
      .from("purchases")
      .select(`
        id, license_tier, status, buyer_email,
        beats(untagged_path, stems_path, has_stems, audio_url)
      `)
      .eq("id", purchase_id)
      .eq("status", "completed")
      .single();

    if (pErr || !purchase) {
      return new Response(JSON.stringify({ error: "Achat introuvable" }), { status: 404, headers: CORS });
    }

    // Sécurité : vérifie que l'email du JWT correspond à l'acheteur
    if (purchase.buyer_email.toLowerCase() !== user.email!.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Accès refusé" }), { status: 403, headers: CORS });
    }

    const beat = purchase.beats as any;
    const tier = purchase.license_tier;

    // ── Sélectionne le bon fichier selon la licence
    const wantsStems =
      (tier === "trackout" || tier === "exclu") && beat?.has_stems && beat?.stems_path;
    const bucket   = wantsStems ? "beats-stems"    : "beats-untagged";
    const filePath = wantsStems ? beat?.stems_path  : beat?.untagged_path;

    let url: string | null = null;

    if (filePath) {
      // Lien signé 48h
      const { data: signed, error: signErr } = await sbAdmin.storage
        .from(bucket)
        .createSignedUrl(filePath, 172800);

      if (signErr) console.error("[get-download-link] createSignedUrl:", signErr.message);
      if (signed?.signedUrl) url = signed.signedUrl;
    }

    // Fallback sur audio_url public si fichier privé introuvable
    if (!url && beat?.audio_url) url = beat.audio_url;

    if (!url) {
      return new Response(JSON.stringify({ error: "Fichier introuvable — contacte le support" }), {
        status: 404, headers: CORS,
      });
    }

    return new Response(JSON.stringify({ url }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[get-download-link]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: CORS,
    });
  }
});
