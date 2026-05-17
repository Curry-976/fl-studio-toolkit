// ══════════════════════════════════════════════════════════════
//  FL STUDIO TOOLKIT — Supabase Configuration
//
//  SETUP (5 min) :
//  1. Va sur https://supabase.com/dashboard → New Project
//  2. Settings → API → copie "Project URL" et "anon public key"
//  3. Remplace les deux valeurs ci-dessous
//  4. SQL Editor → colle le contenu de supabase-setup.sql → Run
//  5. Storage → New bucket "beats-audio" (public) + "beats-covers" (public)
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://TON-PROJECT-ID.supabase.co';
const SUPABASE_ANON = 'ta-cle-anon-publique-ici';

// Couleurs par genre (utilisées pour les waveforms)
const GENRE_COLORS = {
  'Trap':     '#00F0FF',
  'Drill':    '#BF5FFF',
  'Boom Bap': '#FFD700',
  'Lo-Fi':    '#7BA7D4',
  'Afrobeats':'#00FF88',
  'R&B':      '#FF6B9D',
  'Phonk':    '#FF6B35',
  'House':    '#00FFCC',
  'Cloud Rap':'#B9B9FF',
};

// Initialisation du client Supabase
// (supabase-js chargé via CDN dans beatstore.html)
let db = null;

function initSupabase() {
  if (typeof supabase === 'undefined') {
    console.warn('[Supabase] SDK non chargé — mode demo activé');
    return false;
  }
  if (SUPABASE_URL.includes('TON-PROJECT')) {
    console.warn('[Supabase] Clés non configurées — mode demo activé');
    return false;
  }
  db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  console.log('[Supabase] Connecté ✓');
  return true;
}

const SUPABASE_READY = (() => {
  try { return initSupabase(); } catch(e) { return false; }
})();
