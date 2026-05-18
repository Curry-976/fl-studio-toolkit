// ══════════════════════════════════════════════════════════════
//  MayanaBeat — Shared Sidebar Navigation
//  Include dans chaque page : <script src="navbar.js"></script>
//  Détecte automatiquement la page active via window.location.pathname
// ══════════════════════════════════════════════════════════════

(function () {
  // ── Inject sidebar CSS ─────────────────────────────────────
  const style = document.createElement('style');
  style.id = 'navbar-styles';
  style.textContent = `
    /* ── Sidebar shell — #shared-sidebar pour écraser les CSS de pages ── */
    #shared-sidebar {
      width: var(--sidebar-w, 72px) !important;
      background: var(--bg2, #080C1A) !important;
      position: fixed !important;
      left: 0 !important; top: 0 !important; bottom: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      padding: 20px 0 !important;
      z-index: 200 !important;
      gap: 6px !important;
      border-right: 1px solid var(--border2, rgba(0,240,255,.15)) !important;
      box-sizing: border-box !important;
    }

    /* ── Logo ── */
    #shared-sidebar .sidebar-logo {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      flex-shrink: 0;
      text-decoration: none !important;
      transition: filter .2s;
    }
    #shared-sidebar .sidebar-logo:hover {
      filter: drop-shadow(0 0 8px rgba(0,240,255,.5));
    }
    #shared-sidebar .sidebar-logo img {
      width: 40px;
      height: 40px;
    }

    /* ── Nav list ── */
    #shared-sidebar .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    /* ── Nav items ── */
    #shared-sidebar .sb-item {
      width: 44px;
      height: 44px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted, rgba(180,210,255,.35));
      text-decoration: none;
      transition: all .2s;
      position: relative;
    }
    #shared-sidebar .sb-item:hover {
      background: rgba(0,240,255,.06);
      color: var(--cyan, #00F0FF);
      box-shadow: 0 0 12px rgba(0,240,255,.1);
    }
    #shared-sidebar .sb-item.active {
      background: rgba(0,240,255,.08);
      color: var(--cyan, #00F0FF);
      border-left: 2px solid var(--cyan, #00F0FF);
    }
    #shared-sidebar .sb-item svg {
      width: 20px;
      height: 20px;
    }

    /* ── Tooltip ── */
    #shared-sidebar .sb-item::after {
      content: attr(data-tip);
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%) translateX(-4px);
      background: #0A0E20;
      color: var(--cyan, #00F0FF);
      font-family: var(--mono, 'Space Mono', monospace);
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      padding: 8px 14px;
      border: 1px solid rgba(0,240,255,.3);
      clip-path: polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,0 100%);
      pointer-events: none;
      opacity: 0;
      transition: opacity .18s, transform .18s;
      z-index: 9999;
      text-transform: uppercase;
      letter-spacing: .1em;
      box-shadow: 0 0 20px rgba(0,240,255,.15), 0 4px 16px rgba(0,0,0,.6);
    }
    #shared-sidebar .sb-item:hover::after {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }

    /* ── Logout button ── */
    #shared-sidebar .sb-logout {
      width: 44px;
      height: 44px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,80,110,.4);
      background: none;
      border: none;
      cursor: pointer;
      transition: all .2s;
      position: relative;
      flex-shrink: 0;
      margin-top: auto;
    }
    #shared-sidebar .sb-logout:hover {
      background: rgba(255,51,102,.08);
      color: #FF3366;
    }
    #shared-sidebar .sb-logout svg {
      width: 20px;
      height: 20px;
    }
    #shared-sidebar .sb-logout::after {
      content: attr(data-tip);
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%) translateX(-4px);
      background: #0A0E20;
      color: #FF3366;
      font-family: var(--mono, 'Space Mono', monospace);
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      padding: 8px 14px;
      border: 1px solid rgba(255,51,102,.3);
      clip-path: polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,0 100%);
      pointer-events: none;
      opacity: 0;
      transition: opacity .18s, transform .18s;
      z-index: 9999;
      text-transform: uppercase;
      letter-spacing: .1em;
    }
    #shared-sidebar .sb-logout:hover::after {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }

    /* ── Layout helpers (for pages that use .layout wrapper) ── */
    .layout {
      display: flex;
      min-height: 100vh;
    }
    .layout > main,
    .layout > .main-content,
    .layout > section,
    .layout > .page-content {
      margin-left: var(--sidebar-w, 72px);
      flex: 1;
      min-width: 0;
    }

    /* ── Mobile: bottom nav ── */
    @media (max-width: 768px) {
      :root { --sidebar-w: 0px; }

      #shared-sidebar {
        width: 100% !important;
        height: 60px !important;
        top: auto !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        flex-direction: row !important;
        justify-content: space-around !important;
        align-items: center !important;
        padding: 0 8px !important;
        gap: 0 !important;
        border-right: none !important;
        border-top: 1px solid var(--border2, rgba(0,240,255,.15)) !important;
        z-index: 1000 !important;
      }

      /* Hide logo on mobile */
      #shared-sidebar .sidebar-logo { display: none !important; }

      /* Nav becomes a row */
      #shared-sidebar .sidebar-nav {
        flex-direction: row !important;
        gap: 0 !important;
        flex: 1 !important;
        justify-content: space-around !important;
        align-items: center !important;
      }

      #shared-sidebar .sb-item {
        width: 44px !important;
        height: 44px !important;
        border-radius: 8px !important;
        border-left: none !important;
        border-bottom: 2px solid transparent !important;
      }
      #shared-sidebar .sb-item.active {
        border-left: none !important;
        border-bottom: 2px solid var(--cyan, #00F0FF) !important;
      }

      /* Hide tooltips on mobile */
      #shared-sidebar .sb-item::after,
      #shared-sidebar .sb-logout::after { display: none !important; }

      /* Logout at end of row */
      #shared-sidebar .sb-logout {
        margin-top: 0 !important;
        width: 44px !important;
        height: 44px !important;
        flex-shrink: 0 !important;
      }

      body { padding-bottom: 60px; }
    }
  `;
  document.head.appendChild(style);

  // ── Build nav links ────────────────────────────────────────
  const page = window.location.pathname.split('/').pop() || 'index.html';

  const links = [
    {
      href: 'index.html',
      tip: 'Accueil',
      svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`
    },
    {
      href: 'beatstore.html',
      tip: 'Beat Store',
      svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`
    },
    {
      href: 'profile.html',
      tip: 'Compte',
      svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`
    },
    {
      href: 'fl-studio-cheatsheet.html',
      tip: 'Raccourcis',
      svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
    },
    {
      href: 'fl-studio-tips.html',
      tip: 'Conseils',
      svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`
    },
    {
      href: 'beatscan.html',
      tip: 'BeatScan',
      svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>`
    },
    {
      href: 'mastering.html',
      tip: 'Mastering',
      svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/></svg>`
    },
    {
      href: 'songstats.html',
      tip: 'Stats',
      svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`
    },
  ];

  const navHTML = links.map(l => `
    <a href="${l.href}" class="sb-item${page === l.href ? ' active' : ''}" data-tip="${l.tip}">
      ${l.svg}
    </a>`).join('');

  const sidebarHTML = `
    <aside class="sidebar" id="shared-sidebar">
      <a href="index.html" class="sidebar-logo" style="text-decoration:none"><img src="mayanabeat-icon.svg" alt="MayanaBeat" /></a>
      <nav class="sidebar-nav">${navHTML}</nav>
      <button class="sb-logout" id="sb-logout-btn" data-tip="Déconnexion" style="display:none" onclick="sbLogout()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
        </svg>
      </button>
    </aside>`;

  // ── Inject sidebar into DOM ────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Avoid double-injection
    if (document.getElementById('shared-sidebar')) return;

    const layout = document.querySelector('.layout');
    if (layout) {
      layout.insertAdjacentHTML('afterbegin', sidebarHTML);
    } else {
      document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    }

    // ── Show logout button if user is logged in ──────────────
    try {
      const sbKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if (sbKey) {
        const parsed = JSON.parse(localStorage.getItem(sbKey) || '{}');
        const now = Math.floor(Date.now() / 1000);
        if (parsed.user && parsed.expires_at > now - 300) {
          const btn = document.getElementById('sb-logout-btn');
          if (btn) btn.style.display = 'flex';
        }
      }
    } catch(e) {}
  });

  // ── Logout handler ────────────────────────────────────────
  window.sbLogout = async function() {
    try {
      const sbKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if (sbKey) localStorage.removeItem(sbKey);
      // Utilise le client Supabase s'il est disponible
      if (typeof db !== 'undefined' && db && db.auth) await db.auth.signOut();
    } catch(e) {}
    window.location.href = 'profile.html';
  };
})();
