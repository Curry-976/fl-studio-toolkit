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
      clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
      background: linear-gradient(135deg, var(--cyan2,#00C8FF), var(--purple2,#9B7FFF));
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--mono, 'Space Mono', monospace);
      font-weight: 700;
      font-size: 13px;
      color: #000;
      margin-bottom: 24px;
      box-shadow: 0 0 20px rgba(0,240,255,.3);
      flex-shrink: 0;
      text-decoration: none !important;
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
      <a href="index.html" class="sidebar-logo" style="text-decoration:none"><span>MB</span></a>
      <nav class="sidebar-nav">${navHTML}</nav>
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
  });
})();
