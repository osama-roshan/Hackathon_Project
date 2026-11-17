/**
 * js/common.js — NovaWorks AI Project Manager
 * Shared utilities: auth guard, navbar rendering, page transitions,
 * HTML escaping, counter animations, and ripple effects.
 * Loaded on every page (after api.js).
 */

/* --------------------------------------------------------------------------
   1. Auth Guard — redirect to login if no session
   -------------------------------------------------------------------------- */

/**
 * requireAuth(allowedRoles) — call at the top of each page script.
 * allowedRoles: array like ['ADMIN','MANAGER'] or null for any role.
 * Returns the current user object.
 */
function requireAuth(allowedRoles) {
  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem('nw_user') || 'null');
  } catch (e) { user = null; }

  if (!user) {
    navigateTo('login.html');
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate home page
    if (user.role === 'AGENT') navigateTo('my-tasks.html');
    else navigateTo('dashboard.html');
    return null;
  }

  return user;
}

/* --------------------------------------------------------------------------
   2. Smooth Page Navigation
   -------------------------------------------------------------------------- */

/**
 * navigateTo(url) — fade the body out, then navigate.
 */
function navigateTo(url) {
  document.body.classList.add('page-exit');
  setTimeout(() => { window.location.href = url; }, 280);
}

/* Intercept all internal links and nav buttons */
document.addEventListener('click', function (e) {
  const target = e.target.closest('[data-nav]');
  if (!target) return;
  e.preventDefault();
  navigateTo(target.dataset.nav);
});

/* --------------------------------------------------------------------------
   3. HTML Escape — always escape user data before innerHTML
   -------------------------------------------------------------------------- */
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* --------------------------------------------------------------------------
   4. Get initials from a full name (up to 2 chars)
   -------------------------------------------------------------------------- */
function initials(name) {
  if (!name) return '?';
  return name.trim().split(' ')
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

/* --------------------------------------------------------------------------
   5. Format a date string (YYYY-MM-DD) → "Oct 20, 2026"
   -------------------------------------------------------------------------- */
function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00'); // force local time
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* --------------------------------------------------------------------------
   6. Count-up animation for stat numbers
   -------------------------------------------------------------------------- */
/**
 * animateCounter(el, target, duration)
 * el: DOM element whose textContent is updated
 * target: final number
 * duration: ms (default 1200)
 */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

/* --------------------------------------------------------------------------
   7. Navbar Renderer
   -------------------------------------------------------------------------- */
/**
 * renderNavbar(user, activePage)
 * activePage: 'dashboard' | 'team' | 'my-tasks'
 * Inserts the navbar HTML into #navbar element (must exist).
 */
function renderNavbar(user, activePage) {
  const navEl = document.getElementById('navbar');
  if (!navEl) return;

  const roleClass = `badge-${user.role.toLowerCase()}`;

  // Build nav links based on role
  let links = '';
  if (user.role === 'ADMIN' || user.role === 'MANAGER') {
    links += `<a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" data-nav="dashboard.html">Dashboard</a>`;
    links += `<a class="nav-link ${activePage === 'team' ? 'active' : ''}" data-nav="team.html">Team</a>`;
  }
  if (user.role === 'AGENT') {
    links += `<a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" data-nav="dashboard.html">Dashboard</a>`;
    links += `<a class="nav-link ${activePage === 'my-tasks' ? 'active' : ''}" data-nav="my-tasks.html">My Tasks</a>`;
  }

  navEl.innerHTML = `
    <div class="navbar-brand">
      Nova<span>Works</span> <span style="color:var(--text-muted);font-weight:400;font-size:0.85rem">AI</span>
    </div>
    <nav class="navbar-links">${links}</nav>
    <div class="navbar-right">
      <div class="user-info">
        <strong>${esc(user.name)}</strong>
        <span><span class="badge ${esc(roleClass)}">${esc(user.role)}</span></span>
      </div>
      <button class="btn btn-secondary btn-sm" id="logoutBtn">Logout</button>
    </div>
  `;

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try { await logout(); } catch (e) { /* ignore */ }
    sessionStorage.clear();
    navigateTo('login.html');
  });
}

/* --------------------------------------------------------------------------
   8. Loading Overlay
   -------------------------------------------------------------------------- */
function showLoading() {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner-lg"></div>';
    document.body.appendChild(overlay);
  }
  overlay.classList.remove('hidden');
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.add('hidden');
}

/* --------------------------------------------------------------------------
   9. Banner helpers
   -------------------------------------------------------------------------- */
function showBanner(el, type, message, extraHTML = '') {
  el.className = `banner banner-${type} visible`;
  el.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'}</span>
    <span>${esc(message)}${extraHTML}</span>
  `;
}

function hideBanner(el) {
  el.className = 'banner';
  el.innerHTML = '';
}

/* --------------------------------------------------------------------------
   10. Staggered animation delay helper for cards / rows
   -------------------------------------------------------------------------- */
/**
 * staggerElements(elements, baseDelay, increment)
 * Sets animation-delay on each element for staggered entrance.
 */
function staggerElements(elements, baseDelay = 0, increment = 80) {
  Array.from(elements).forEach((el, i) => {
    el.style.animationDelay = `${baseDelay + i * increment}ms`;
  });
}

/* --------------------------------------------------------------------------
   11. Role badge helper
   -------------------------------------------------------------------------- */
function roleBadge(role) {
  const cls = { ADMIN: 'badge-admin', MANAGER: 'badge-manager', AGENT: 'badge-agent' }[role] || 'badge-agent';
  return `<span class="badge ${esc(cls)}">${esc(role)}</span>`;
}
