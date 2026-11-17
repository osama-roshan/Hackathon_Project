/**
 * js/team.js — Team Directory page
 * Read-only cards with initials avatar, name, role badge, specialization.
 */

(function () {
  'use strict';

  /* ---- Auth guard (ADMIN and MANAGER can see team) ---- */
  const user = requireAuth(['ADMIN', 'MANAGER']);
  if (!user) return;

  renderNavbar(user, 'team');

  const teamLoading = document.getElementById('teamLoading');
  const teamEmpty   = document.getElementById('teamEmpty');
  const teamGrid    = document.getElementById('teamGrid');

  /* ---- Load team ---- */
  async function loadTeam() {
    try {
      const members = await getTeam();
      renderTeam(members);
    } catch (err) {
      teamLoading.style.display = 'none';
      teamEmpty.style.display   = 'block';
      teamEmpty.querySelector('p').textContent = err.message || 'Could not load team.';
    }
  }

  /* ---- Render team cards ---- */
  function renderTeam(members) {
    teamLoading.style.display = 'none';

    if (!members || members.length === 0) {
      teamEmpty.style.display = 'block';
      return;
    }

    teamGrid.style.display = 'grid';
    teamGrid.innerHTML = members.map((m, i) => `
      <div class="card team-card card-animated">
        <div class="avatar avatar-lg" style="flex-shrink:0;">${esc(initials(m.name))}</div>
        <div class="team-card-info">
          <h3>${esc(m.name)}</h3>
          <p>${esc(m.specialization || '—')}</p>
          <div style="margin-top:0.5rem;">${roleBadge(m.role)}</div>
        </div>
      </div>
    `).join('');

    /* Stagger entrance */
    staggerElements(teamGrid.querySelectorAll('.card'), 0, 80);
  }

  loadTeam();

})();
