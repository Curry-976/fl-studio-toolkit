// ══════════════════════════════════════════════════════════════
//  Edge Function: send-license-email
//  Envoie le beat + PDF de licence à l'acheteur après paiement
//
//  Secrets requis :
//    RESEND_API_KEY=re_xxxxxxxxxxxxxxxx  (resend.com)
//    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injectés)
// ══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { purchase_id } = await req.json();
    if (!purchase_id) throw new Error("purchase_id manquant");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Récupère l'achat + beat + producteur
    const { data: purchase, error: pErr } = await sb
      .from("purchases")
      .select("*, beats(*, producers(username, display_name))")
      .eq("id", purchase_id)
      .single();

    if (pErr || !purchase) throw new Error("Achat introuvable : " + pErr?.message);
    if (purchase.status !== "completed") throw new Error("Achat non complété");

    const beat = purchase.beats;
    const producer = beat?.producers;

    // ── Génère un lien signé (valide 7 jours)
    let downloadUrl = beat?.audio_url || null;
    if (beat?.audio_path) {
      const { data: signed, error: signErr } = await sb.storage
        .from("beats-audio")
        .createSignedUrl(beat.audio_path, 60 * 60 * 24 * 7); // 7 jours
      if (!signErr && signed?.signedUrl) downloadUrl = signed.signedUrl;
    }

    if (!downloadUrl) throw new Error("Fichier audio introuvable en storage");

    // ── Labels licence
    const TIER_LABELS: Record<string, string> = {
      lease: "Lease Non-Exclusif",
      trackout: "Trackout Premium",
      exclu: "Exclusivité Totale",
    };
    const TIER_RIGHTS: Record<string, string[]> = {
      lease: ["MP3 + WAV", "100 000 streams max", "2 vidéos YouTube monétisées", "Usage commercial"],
      trackout: ["MP3 + WAV + Stems", "500 000 streams max", "Distribution digitale", "Usage commercial & radio"],
      exclu: ["MP3 + WAV + Stems", "Streams illimités", "Tous droits transférés", "Sync TV / Film / Pub"],
    };

    const tier = purchase.license_tier;
    const tierLabel = TIER_LABELS[tier] || tier;
    const rights = TIER_RIGHTS[tier] || [];
    const priceEur = (purchase.amount_cents / 100).toFixed(2);
    const buyerName = purchase.buyer_name || purchase.buyer_email.split("@")[0];
    const producerName = producer?.display_name || producer?.username || "Producteur";

    // ── Template email HTML
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ton beat est prêt !</title>
</head>
<body style="margin:0;padding:0;background:#03050D;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#03050D;min-height:100vh;">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#080C1A;border:1px solid rgba(0,240,255,.15);border-bottom:none;padding:32px 40px;text-align:center;">
    <div style="display:inline-block;background:linear-gradient(135deg,#00C8FF,#9B7FFF);padding:10px 20px;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));margin-bottom:20px;">
      <span style="font-family:'Courier New',monospace;font-weight:700;font-size:14px;color:#000;letter-spacing:.1em;">MAYANABEAT</span>
    </div>
    <h1 style="color:#00F0FF;font-family:'Courier New',monospace;font-size:22px;font-weight:700;margin:0;letter-spacing:.05em;">
      🎵 TON BEAT EST PRÊT
    </h1>
    <p style="color:rgba(180,210,255,.6);font-size:13px;margin:8px 0 0;">Paiement confirmé · Téléchargement disponible</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#080C1A;border:1px solid rgba(0,240,255,.15);border-top:none;border-bottom:none;padding:0 40px 32px;">

    <!-- Greeting -->
    <p style="color:#E8F0FF;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Salut <strong style="color:#00F0FF;">${buyerName}</strong>,<br/>
      ton achat a bien été confirmé. Voici ton lien de téléchargement sécurisé.
    </p>

    <!-- Beat card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1530;border:1px solid rgba(0,240,255,.15);border-left:3px solid #00F0FF;margin-bottom:24px;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 4px;color:rgba(180,210,255,.5);font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:.1em;">Beat</p>
      <p style="margin:0 0 12px;color:#E8F0FF;font-size:20px;font-weight:700;">${beat?.title || "—"}</p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:24px;"><span style="color:rgba(180,210,255,.5);font-size:11px;">Producteur</span><br/><span style="color:#00F0FF;font-size:13px;font-weight:600;">${producerName}</span></td>
          <td style="padding-right:24px;"><span style="color:rgba(180,210,255,.5);font-size:11px;">Genre</span><br/><span style="color:#E8F0FF;font-size:13px;">${beat?.genre || "—"}</span></td>
          <td style="padding-right:24px;"><span style="color:rgba(180,210,255,.5);font-size:11px;">BPM</span><br/><span style="color:#E8F0FF;font-size:13px;">${beat?.bpm || "—"}</span></td>
          <td><span style="color:rgba(180,210,255,.5);font-size:11px;">Tonalité</span><br/><span style="color:#E8F0FF;font-size:13px;">${beat?.key || "—"}</span></td>
        </tr>
      </table>
    </td></tr>
    </table>

    <!-- Download button -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td align="center">
      <a href="${downloadUrl}" style="display:inline-block;background:linear-gradient(135deg,#00F0FF,#00C8FF);color:#000;font-family:'Courier New',monospace;font-weight:700;font-size:14px;letter-spacing:.08em;text-decoration:none;padding:16px 40px;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));">
        ⬇ TÉLÉCHARGER LE BEAT
      </a>
      <p style="color:rgba(180,210,255,.4);font-size:11px;margin:8px 0 0;">Lien valide 7 jours · Usage selon licence ci-dessous</p>
    </td></tr>
    </table>

    <!-- License -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1228;border:1px solid rgba(191,95,255,.2);margin-bottom:24px;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 12px;color:rgba(180,210,255,.5);font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:.1em;">Licence</p>
      <p style="margin:0 0 12px;color:#BF5FFF;font-size:16px;font-weight:700;">${tierLabel}</p>
      <p style="margin:0 0 8px;color:rgba(180,210,255,.5);font-size:11px;">Droits inclus :</p>
      ${rights.map(r => `<p style="margin:0 0 4px;color:#E8F0FF;font-size:13px;">✓ ${r}</p>`).join("")}
      <p style="margin:16px 0 0;color:rgba(180,210,255,.4);font-size:11px;">
        Montant : <strong style="color:#FFD700;">${priceEur} €</strong> ·
        Réf. achat : <code style="color:rgba(180,210,255,.5);">${purchase.id.slice(0, 8).toUpperCase()}</code>
      </p>
    </td></tr>
    </table>

    <p style="color:rgba(180,210,255,.4);font-size:12px;line-height:1.6;margin:0;">
      Des questions ? Réponds directement à cet email.<br/>
      Le lien expire dans 7 jours — sauvegarde ton fichier !
    </p>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#080C1A;border:1px solid rgba(0,240,255,.15);border-top:2px solid rgba(0,240,255,.15);padding:20px 40px;text-align:center;">
    <p style="color:rgba(180,210,255,.3);font-size:11px;font-family:'Courier New',monospace;margin:0;letter-spacing:.05em;">
      MAYANABEAT · Beat Store · <a href="https://curry-976.github.io/fl-studio-toolkit/beatstore.html" style="color:rgba(0,240,255,.5);text-decoration:none;">Retour au store</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    // ── Envoie via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY non configuré");

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MayanaBeat <noreply@mayanabeat.com>",
        to: [purchase.buyer_email],
        subject: `🎵 Ton beat "${beat?.title}" est prêt — ${tierLabel}`,
        html,
      }),
    });

    const emailData = await emailRes.json();
    if (!emailRes.ok) throw new Error("Resend error: " + JSON.stringify(emailData));

    console.log(`[send-license-email] ✅ Email envoyé à ${purchase.buyer_email} — ID: ${emailData.id}`);

    // ── Met à jour la date d'envoi (optionnel)
    await sb.from("purchases").update({ license_pdf_url: downloadUrl }).eq("id", purchase_id);

    return new Response(JSON.stringify({ success: true, email_id: emailData.id }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[send-license-email]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
