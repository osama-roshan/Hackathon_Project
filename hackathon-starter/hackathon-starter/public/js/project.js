/**
 * js/project.js — Project detail page
 * Reads ?id= from URL, fetches project, renders header + task table.
 */

(function () {
  'use strict';

  /* ---- Auth guard (all roles may visit if they have access) ---- */
  const user = requireAuth(null);
  if (!user) return;

  renderNavbar(user, '');

  /* ---- Parse project ID from URL ---- */
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');

  const pageLoading    = document.getElementById('pageLoading');
  const accessDenied   = document.getElementById('accessDenied');
  const projectContent = document.getElementById('projectContent');
  const projectHeader  = document.getElementById('projectHeader');
  const tasksBody      = document.getElementById('tasksBody');
  const hoursTotal     = document.getElementById('hoursTotal');

  if (!projectId) {
    navigateTo('dashboard.html');
    return;
  }

  /* ---- Load project ---- */
  async function loadProject() {
    try {
      const project = await getProjectById(projectId);
      renderProject(project);
    } catch (err) {
      pageLoading.style.display = 'none';
      if (err.message === 'ACCESS_DENIED') {
        accessDenied.style.display = 'block';
      } else {
        accessDenied.style.display = 'block';
        accessDenied.querySelector('p').textContent = err.message;
      }
    }
  }

  /* ---- Render project ---- */
  function renderProject(p) {
    document.title = `${esc(p.name)} — NovaWorks AI`;
    pageLoading.style.display    = 'none';
    projectContent.style.display = 'block';

    /* Header */
    projectHeader.innerHTML = `
      <h1>${esc(p.name)}</h1>
      <div class="detail-meta">
        <span>🏢 <strong>Client:</strong> ${esc(p.clientName)}</span>
        <span>👤 <strong>Manager:</strong> ${esc(p.manager ? p.manager.name : '—')}</span>
        <span>📅 <strong>Deadline:</strong> ${formatDate(p.deadline)}</span>
      </div>
      ${p.description ? `<p style="margin-top:1rem;color:var(--text-muted);font-size:0.9rem;">${esc(p.description)}</p>` : ''}
    `;

    /* Tasks */
    const tasks = p.tasks || [];
    if (tasks.length === 0) {
      tasksBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem;">
            No tasks found for this project.
          </td>
        </tr>`;
    } else {
      tasksBody.innerHTML = tasks.map((t, i) => `
        <tr style="animation-delay:${i * 70}ms;">
          <td><strong>${esc(t.title)}</strong></td>
          <td style="color:var(--text-muted);max-width:260px;">${esc(t.description || '—')}</td>
          <td>
            <div class="avatar-name">
              <div class="avatar">${esc(initials(t.assignee ? t.assignee.name : '?'))}</div>
              <span>${esc(t.assignee ? t.assignee.name : '—')}</span>
            </div>
          </td>
          <td>${formatDate(t.deadline)}</td>
          <td style="text-align:right;font-weight:600;color:var(--accent);">${t.estimatedHours || 0}h</td>
        </tr>
      `).join('');
    }

    /* Total hours */
    const total = tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
    hoursTotal.textContent = `Total estimated: ${total}h`;
  }

  loadProject();

})();
