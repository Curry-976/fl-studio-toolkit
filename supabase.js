// ══════════════════════════════════════════════════════════════
//  Mayanabeat — Supabase Configuration
//
//  SETUP (5 min) :
//  1. Va sur https://supabase.com/dashboard → New Project
//  2. Settings → API → copie "Project URL" et "anon public key"
//  3. Remplace les deux valeurs ci-dessous
//  4. SQL Editor → colle le contenu de supabase-setup.sql → Run
//  5. Storage → New bucket "beats-audio" (public) + "beats-covers" (public)
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://fjwftrucqerwshhpmezl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqd2Z0cnVjcWVyd3NoaHBtZXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTY5MTYsImV4cCI6MjA5NDU5MjkxNn0.Lhc2F9LeqRQOqcnOSiF46pvwwIMXgnnNAI0YRmjkpWU';

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
  db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      flowType: 'implicit',       // retourne #access_token dans l'URL (pas PKCE ?code=)
      autoRefreshToken: false,    // on gère le refresh manuellement (bypass navigator.locks)
      persistSession: true,
      detectSessionInUrl: false,  // on le fait manuellement dans checkAuth
    }
  });
  console.log('[Supabase] Connecté ✓');
  return true;
}

const SUPABASE_READY = (() => {
  try { return initSupabase(); } catch(e) { return false; }
})();
