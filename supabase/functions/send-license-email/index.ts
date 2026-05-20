// ══════════════════════════════════════════════════════════════
//  Edge Function: send-license-email
//  Envoie le beat + licence à l'acheteur via SMTP OVHcloud
//
//  Secrets requis :
//    SMTP_HOST=ssl0.ovh.net
//    SMTP_PORT=465
//    SMTP_USER=noreply@mayanabeat.fr
//    SMTP_PASS=***
//    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injectés)
// ══════════════════════════════════════════════════════════════

import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { purchase_id } = await req.json();
    if (!purchase_id) throw new Error("purchase_id manquant");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: purchase, error: pErr } = await sb
      .from("purchases")
      .select(`
        *,
        beats(
          id, title, genre, bpm, key, audio_url,
          audio_path, untagged_path, stems_path, has_stems,
          producers(username, display_name)
        )
      `)
      .eq("id", purchase_id)
      .single();

    if (pErr || !purchase) throw new Error("Achat introuvable");
    if (purchase.status !== "completed") throw new Error("Achat non complété");

    const beat = purchase.beats;
    const producer = beat?.producers;
    const tier = purchase.license_tier; // 'lease' | 'trackout' | 'exclu'

    // ── Sélectionne le bon fichier selon la licence
    // Règle : trackout/exclu → stems si disponibles, sinon fichier propre
    //         lease          → toujours le fichier propre (untagged)
    // JAMAIS le fichier taggué (audio_path) — c'est la démo streaming uniquement.

    const wantsStems = (tier === "trackout" || tier === "exclu") && beat?.has_stems && beat?.stems_path;
    const bucket     = wantsStems ? "beats-stems"    : "beats-untagged";
    const filePath   = wantsStems ? beat?.stems_path  : beat?.untagged_path;

    if (!filePath) {
      // Fallback : si le producteur a uploadé avant la migration v3, on essaie l'ancien audio_url
      if (beat?.audio_url) {
        console.warn("[send-license-email] Fallback sur audio_url (fichier taggué) — beat non migré");
      } else {
        throw new Error("Fichier de téléchargement introuvable pour cet achat");
      }
    }

    // Lien signé 7 jours (bucket privé — accès limité)
    let downloadUrl: string | null = null;
    if (filePath) {
      const { data: signed, error: signErr } = await sb.storage
        .from(bucket)
        .createSignedUrl(filePath, 604800); // 7 jours
      if (signErr) console.error("[send-license-email] createSignedUrl:", signErr.message);
      if (signed?.signedUrl) downloadUrl = signed.signedUrl;
    }

    // Fallback sur l'audio_url public si rien d'autre (beats pré-migration)
    if (!downloadUrl && beat?.audio_url) downloadUrl = beat.audio_url;
    if (!downloadUrl) throw new Error("Impossible de générer le lien de téléchargement");

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

    const tierLabel = TIER_LABELS[tier] || tier;
    const rights = TIER_RIGHTS[tier] || [];
    const priceEur = (purchase.amount_cents / 100).toFixed(2);
    const buyerName = purchase.buyer_name || purchase.buyer_email.split("@")[0];
    const producerName = producer?.display_name || producer?.username || "Producteur";

    const purchaseDate = new Date(purchase.created_at);
    const dateStr = purchaseDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    const invoiceNum = `MB-${purchaseDate.getFullYear()}${String(purchaseDate.getMonth() + 1).padStart(2, "0")}-${purchase.id.slice(0, 8).toUpperCase()}`;

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#03050D;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="background:#080C1A;border:1px solid rgba(0,240,255,.15);padding:32px 40px;text-align:center;">
  <p style="margin:0 0 12px;font-family:'Courier New',monospace;font-weight:700;font-size:18px;letter-spacing:.15em;color:#00F0FF;">MAYANABEAT</p>
  <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 8px;">🎵 Ton beat est prêt !</h1>
  <p style="color:rgba(180,210,255,.6);font-size:13px;margin:0;">Paiement confirmé · Téléchargement disponible 7 jours</p>
</td></tr>
<tr><td style="background:#080C1A;border:1px solid rgba(0,240,255,.15);border-top:none;padding:32px 40px;">
  <p style="color:#E8F0FF;font-size:15px;line-height:1.6;margin:0 0 28px;">
    Salut <strong style="color:#00F0FF;">${buyerName}</strong> 👋<br/>
    Merci pour ton achat. Ton beat est disponible ci-dessous.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1530;border-left:3px solid #00F0FF;margin-bottom:28px;">
  <tr><td style="padding:20px 24px;">
    <p style="margin:0 0 4px;color:rgba(180,210,255,.5);font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:.12em;">Beat</p>
    <p style="margin:0 0 10px;color:#fff;font-size:22px;font-weight:700;">${beat?.title || "—"}</p>
    <p style="margin:0;color:rgba(180,210,255,.7);font-size:13px;">
      Par <strong style="color:#00F0FF;">${producerName}</strong>
      · ${beat?.genre || ""} · ${beat?.bpm || ""}BPM · ${beat?.key || ""}
    </p>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
  <tr><td align="center">
    <a href="${downloadUrl}" style="display:inline-block;background:#00F0FF;color:#000;font-family:'Courier New',monospace;font-weight:700;font-size:15px;letter-spacing:.08em;text-decoration:none;padding:18px 48px;">
      ⬇ TÉLÉCHARGER MON BEAT
    </a>
    <p style="color:rgba(180,210,255,.4);font-size:11px;margin:10px 0 0;">Lien sécurisé · Expire dans 7 jours</p>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1228;border:1px solid rgba(191,95,255,.25);margin-bottom:24px;">
  <tr><td style="padding:20px 24px;">
    <p style="margin:0 0 12px;font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:rgba(180,210,255,.5);">Ta licence</p>
    <p style="margin:0 0 14px;color:#BF5FFF;font-size:17px;font-weight:700;">${tierLabel}</p>
    ${rights.map(r => `<p style="margin:0 0 6px;color:#E8F0FF;font-size:13px;"><span style="color:#00FF88;">✓</span> ${r}</p>`).join("")}
    <p style="margin:16px 0 0;padding-top:14px;border-top:1px solid rgba(0,240,255,.08);color:rgba(180,210,255,.4);font-size:11px;">
      Montant : <strong style="color:#FFD700;">${priceEur} €</strong>
      · Réf. : <code>${purchase.id.slice(0, 8).toUpperCase()}</code>
    </p>
  </td></tr></table>
  <p style="color:rgba(180,210,255,.35);font-size:12px;line-height:1.7;margin:0 0 28px;">
    Sauvegarde ton fichier — le lien expire dans 7 jours.<br/>
    Des questions ? Réponds à cet email. Bonne création 🎧
  </p>

  <!-- ── Facture / Reçu ── -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080C1A;border:1px solid rgba(0,240,255,.08);margin-bottom:24px;">
  <tr><td style="padding:14px 24px;border-bottom:1px solid rgba(0,240,255,.08);">
    <table width="100%"><tr>
      <td>
        <p style="margin:0 0 2px;font-family:'Courier New',monospace;font-size:9px;color:rgba(180,210,255,.35);text-transform:uppercase;letter-spacing:.12em;">Reçu de paiement</p>
        <p style="margin:0;font-family:'Courier New',monospace;font-size:13px;font-weight:700;color:#E8F0FF;">${invoiceNum}</p>
      </td>
      <td style="text-align:right;">
        <p style="margin:0;font-size:11px;color:rgba(180,210,255,.4);">${dateStr}</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:16px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:50%;vertical-align:top;padding-right:12px;">
        <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:9px;color:rgba(180,210,255,.3);text-transform:uppercase;letter-spacing:.1em;">Vendeur</p>
        <p style="margin:0 0 2px;font-size:12px;font-weight:600;color:#E8F0FF;">MayanaBeat</p>
        <p style="margin:0;font-size:11px;color:rgba(180,210,255,.35);">mayanabeat.fr</p>
      </td>
      <td style="width:50%;vertical-align:top;padding-left:12px;border-left:1px solid rgba(0,240,255,.06);">
        <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:9px;color:rgba(180,210,255,.3);text-transform:uppercase;letter-spacing:.1em;">Acheteur</p>
        <p style="margin:0 0 2px;font-size:12px;font-weight:600;color:#E8F0FF;">${buyerName}</p>
        <p style="margin:0;font-size:11px;color:rgba(180,210,255,.35);">${purchase.buyer_email}</p>
      </td>
    </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(0,240,255,.06);">
    <tr>
      <td style="font-size:12px;color:#E8F0FF;padding-bottom:4px;">
        Beat <strong>"${beat?.title || "—"}"</strong> — ${tierLabel}
        <br/><span style="font-size:10px;color:rgba(180,210,255,.4);">Par ${producerName} · ${beat?.genre || ""} · ${beat?.bpm || ""}BPM</span>
      </td>
      <td style="text-align:right;font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:#FFD700;white-space:nowrap;vertical-align:top;">${priceEur} €</td>
    </tr>
    <tr>
      <td colspan="2" style="padding-top:10px;border-top:1px solid rgba(0,240,255,.06);">
        <table width="100%"><tr>
          <td style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;color:#E8F0FF;text-transform:uppercase;letter-spacing:.06em;">Total TTC</td>
          <td style="text-align:right;font-family:'Courier New',monospace;font-size:15px;font-weight:700;color:#FFD700;">${priceEur} €</td>
        </tr></table>
        <p style="margin:6px 0 0;font-size:10px;color:rgba(180,210,255,.25);font-style:italic;">TVA non applicable — Article 293B du CGI</p>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>

  <!-- ── Lien portail client ── -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
  <tr><td style="background:rgba(0,240,255,.03);border:1px solid rgba(0,240,255,.08);padding:14px 20px;text-align:center;">
    <p style="margin:0;font-size:12px;color:rgba(180,210,255,.4);">
      Retrouve tous tes achats et re-télécharge tes fichiers sur
      <a href="https://mayanabeat.fr/client.html" style="color:#00F0FF;text-decoration:none;">mayanabeat.fr/client.html</a>
    </p>
  </td></tr>
  </table>

</td></tr>
<tr><td style="background:#080C1A;border:1px solid rgba(0,240,255,.15);border-top:2px solid rgba(0,240,255,.12);padding:18px 40px;text-align:center;">
  <p style="color:rgba(180,210,255,.25);font-size:11px;font-family:'Courier New',monospace;margin:0;">
    MAYANABEAT ·
    <a href="https://mayanabeat.fr/beatstore.html" style="color:rgba(0,240,255,.4);text-decoration:none;">Beat Store</a>
    · noreply@mayanabeat.fr
  </p>
</td></tr>
</table></td></tr></table></body></html>`;

    // ── Connexion SMTP OVHcloud via nodemailer
    const transporter = nodemailer.createTransport({
      host: Deno.env.get("SMTP_HOST") || "ssl0.ovh.net",
      port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
      secure: true,
      auth: {
        user: Deno.env.get("SMTP_USER")!,
        pass: Deno.env.get("SMTP_PASS")!,
      },
    });

    await transporter.sendMail({
      from: "MayanaBeat <noreply@mayanabeat.fr>",
      to: purchase.buyer_email,
      subject: `🎵 Ton beat "${beat?.title || ""}" est prêt — ${tierLabel}`,
      html,
    });

    // Sauvegarde le lien de téléchargement
    await sb.from("purchases").update({ license_pdf_url: downloadUrl }).eq("id", purchase_id);

    console.log("[send-license-email] ✅ Email envoyé à", purchase.buyer_email);
    return new Response(JSON.stringify({ success: true }), {
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
