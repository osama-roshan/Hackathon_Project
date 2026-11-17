/**
 * js/my-tasks.js — My Tasks page (AGENT view)
 * Shows all tasks assigned to the current user with project links.
 */

(function () {
  'use strict';

  /* ---- Auth guard — agents (and admins viewing their own tasks) ---- */
  const user = requireAuth(null);
  if (!user) return;

  renderNavbar(user, 'my-tasks');

  const tasksLoading      = document.getElementById('tasksLoading');
  const tasksEmpty        = document.getElementById('tasksEmpty');
  const tasksTableWrapper = document.getElementById('tasksTableWrapper');
  const myTasksBody       = document.getElementById('myTasksBody');
  const agentTaskCount    = document.getElementById('agentTaskCount');
  const agentHoursCount   = document.getElementById('agentHoursCount');

  /* ---- Load tasks ---- */
  async function loadTasks() {
    try {
      const tasks = await getMyTasks();
      renderTasks(tasks);
    } catch (err) {
      tasksLoading.style.display = 'none';
      tasksEmpty.style.display   = 'block';
      tasksEmpty.querySelector('p').textContent = err.message || 'Could not load tasks.';
    }
  }

  /* ---- Render tasks ---- */
  function renderTasks(tasks) {
    tasksLoading.style.display = 'none';

    /* Update stat cards */
    const totalHours = tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
    animateCounter(agentTaskCount,  tasks.length);
    animateCounter(agentHoursCount, totalHours);

    if (!tasks || tasks.length === 0) {
      tasksEmpty.style.display = 'block';
      return;
    }

    tasksTableWrapper.style.display = 'block';

    myTasksBody.innerHTML = tasks.map((t, i) => `
      <tr style="animation-delay:${i * 60}ms;">
        <td><strong>${esc(t.title)}</strong></td>
        <td>
          <a href="project.html?id=${esc(t.projectId)}"
             style="color:var(--accent);font-weight:500;"
             onclick="event.stopPropagation()">
            ${esc(t.projectName)}
          </a>
        </td>
        <td>
          <div class="avatar-name">
            <div class="avatar" style="width:26px;height:26px;font-size:0.65rem;">
              ${esc(initials(t.manager ? t.manager.name : '?'))}
            </div>
            <span>${esc(t.manager ? t.manager.name : '—')}</span>
          </div>
        </td>
        <td>${formatDate(t.deadline)}</td>
        <td style="text-align:right;font-weight:600;color:var(--accent);">${t.estimatedHours || 0}h</td>
      </tr>
    `).join('');
  }

  loadTasks();

})();
