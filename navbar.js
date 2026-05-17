// ══════════════════════════════════════════════════════════════
//  MayanaBeat — Shared Sidebar Navigation
//  Include dans chaque page : <script src="navbar.js"></script>
//  Détecte automatiquement la page active via window.location.pathname
// ══════════════════════════════════════════════════════════════

(function () {
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
      tip: 'Mon Profil',
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

  // Injecte la sidebar au début du .layout ou du body
  document.addEventListener('DOMContentLoaded', () => {
    const layout = document.querySelector('.layout');
    if (layout) {
      layout.insertAdjacentHTML('afterbegin', sidebarHTML);
    } else {
      document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    }
  });
})();
