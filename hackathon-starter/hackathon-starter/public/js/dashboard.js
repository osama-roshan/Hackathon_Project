/**
 * js/dashboard.js — Dashboard page logic
 * Handles: stats, project cards, transcript panel (ADMIN), AI progress steps.
 */

(function () {
  'use strict';

  /* ---- Auth guard ---- */
  const user = requireAuth(['ADMIN', 'MANAGER']);
  if (!user) return;

  /* ---- Render navbar ---- */
  renderNavbar(user, 'dashboard');

  /* ---- Set page subtitle ---- */
  document.getElementById('pageSubtitle').textContent =
    user.role === 'ADMIN'
      ? 'Full overview · all projects'
      : `Your projects, ${user.name.split(' ')[0]}`;

  /* ---- DOM references ---- */
  const transcriptPanel   = document.getElementById('transcriptPanel');
  const transcriptInput   = document.getElementById('transcriptInput');
  const createBtn         = document.getElementById('createBtn');
  const loadSampleBtn     = document.getElementById('loadSampleBtn');
  const clearBtn          = document.getElementById('clearBtn');
  const transcriptWarning = document.getElementById('transcriptWarning');
  const aiPanel           = document.getElementById('aiPanel');
  const aiStepsEl         = document.getElementById('aiSteps');
  const successBanner     = document.getElementById('successBanner');
  const errorBanner       = document.getElementById('errorBanner');

  const projectsLoading   = document.getElementById('projectsLoading');
  const projectsEmpty     = document.getElementById('projectsEmpty');
  const cardsGrid         = document.getElementById('cardsGrid');

  const statProjects      = document.getElementById('statProjects');
  const statTasks         = document.getElementById('statTasks');
  const statHours         = document.getElementById('statHours');

  /* ---- Show transcript panel for ADMIN only ---- */
  if (user.role === 'ADMIN') {
    transcriptPanel.style.display = 'block';
  }

  /* ---- AI step definitions ---- */
  const AI_STEPS = [
    'Reading the meeting',
    'Finding projects and tasks',
    'Assigning the team',
    'Saving to database',
  ];

  /* Render step list (all pending) */
  function renderAiStepsPending() {
    aiStepsEl.innerHTML = AI_STEPS.map((label, i) => `
      <div class="ai-step" id="aiStep${i}">
        <span class="step-icon"><span style="width:18px;height:18px;display:block;border-radius:50%;border:2px solid var(--border);"></span></span>
        <span>${esc(label)}</span>
      </div>
    `).join('');
  }

  /* Update a single step */
  function setStepStatus(index, status) {
    const stepEl = document.getElementById(`aiStep${index}`);
    if (!stepEl) return;

    const iconEl = stepEl.querySelector('.step-icon');
    stepEl.className = `ai-step ${status}`;

    if (status === 'doing') {
      iconEl.innerHTML = '<div class="spinner"></div>';
    } else if (status === 'done') {
      // SVG check with draw animation
      iconEl.innerHTML = `
        <svg class="check-icon" viewBox="0 0 20 20" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 10l4 4 8-8"/>
        </svg>`;
    }
  }

  /* ---- Load and render projects ---- */
  async function loadProjects(highlightNew = false) {
    projectsLoading.style.display = 'block';
    cardsGrid.style.display       = 'none';
    projectsEmpty.style.display   = 'none';

    try {
      const projects = await getProjects();
      renderProjects(projects, highlightNew);
      updateStats(projects);
    } catch (err) {
      projectsLoading.style.display = 'none';
      projectsEmpty.style.display   = 'block';
      projectsEmpty.querySelector('p').textContent = err.message;
    }
  }

  function updateStats(projects) {
    const totalTasks = projects.reduce((s, p) => s + (p.tasks ? p.tasks.length : 0), 0);
    const totalHours = projects.reduce((s, p) =>
      s + (p.tasks ? p.tasks.reduce((ts, t) => ts + (t.estimatedHours || 0), 0) : 0), 0);

    animateCounter(statProjects, projects.length);
    animateCounter(statTasks,    totalTasks);
    animateCounter(statHours,    totalHours);
  }

  function renderProjects(projects, highlightNew) {
    projectsLoading.style.display = 'none';

    if (!projects || projects.length === 0) {
      projectsEmpty.style.display = 'block';
      cardsGrid.style.display     = 'none';
      return;
    }

    projectsEmpty.style.display = 'none';
    cardsGrid.style.display     = 'grid';
    cardsGrid.innerHTML = projects.map((p, i) => buildProjectCard(p, i, highlightNew && p.isNew)).join('');

    /* Stagger animation delays */
    staggerElements(cardsGrid.querySelectorAll('.project-card'), 0, 100);

    /* Click → navigate to project detail */
    cardsGrid.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        navigateTo(`project.html?id=${encodeURIComponent(card.dataset.id)}`);
      });
    });
  }

  function buildProjectCard(p, index, isNew) {
    const taskCount = p.tasks ? p.tasks.length : 0;
    const totalHours = p.tasks
      ? p.tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0)
      : 0;

    const newBadge = isNew ? '<span class="badge badge-new">New</span>' : '';
    const extraClass = isNew ? 'card-new-highlight' : '';

    return `
      <div class="card project-card card-animated ${extraClass}" data-id="${esc(p.id)}" tabindex="0"
           role="button" aria-label="Open project ${esc(p.name)}">
        <div class="project-card-header">
          <h3>${esc(p.name)}</h3>
          ${newBadge}
        </div>
        <div class="project-meta">
          <span>🏢 ${esc(p.clientName)}</span>
          <span>👤 ${esc(p.manager ? p.manager.name : '—')}</span>
          <span>📅 ${formatDate(p.deadline)}</span>
        </div>
        <div class="project-footer">
          <span>🗂 ${taskCount} task${taskCount !== 1 ? 's' : ''}</span>
          <span>⏱ ${totalHours}h total</span>
        </div>
      </div>
    `;
  }

  /* ---- Transcript: Load Sample ---- */
  loadSampleBtn.addEventListener('click', () => {
    transcriptInput.value = SAMPLE_TRANSCRIPT;
    hideWarningAndBanners();
    transcriptInput.focus();
  });

  /* ---- Transcript: Clear ---- */
  clearBtn.addEventListener('click', () => {
    transcriptInput.value = '';
    hideWarningAndBanners();
    resetAiPanel();
    transcriptInput.focus();
  });

  function hideWarningAndBanners() {
    transcriptWarning.style.display = 'none';
    hideBanner(successBanner);
    hideBanner(errorBanner);
  }

  function resetAiPanel() {
    aiPanel.classList.remove('visible', 'active');
    aiStepsEl.innerHTML = '';
  }

  /* ---- Transcript: Create from Transcript ---- */
  let isProcessing = false;

  createBtn.addEventListener('click', async () => {
    if (isProcessing) return; // double-click guard

    hideWarningAndBanners();
    resetAiPanel();

    const transcript = transcriptInput.value.trim();
    if (!transcript) {
      transcriptWarning.style.display = 'flex';
      transcriptInput.focus();
      return;
    }

    /* Lock UI */
    isProcessing = true;
    createBtn.disabled    = true;
    loadSampleBtn.disabled = true;
    clearBtn.disabled     = true;
    createBtn.textContent = '⏳ Processing…';

    /* Show AI panel */
    renderAiStepsPending();
    aiPanel.classList.add('visible', 'active');
    aiPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      const result = await createFromTranscript(transcript, (stepIndex, status) => {
        setStepStatus(stepIndex, status);
      });

      /* Done — stop glow */
      aiPanel.classList.remove('active');

      /* Success banner with count-up numbers */
      const proj = result.projectCount || 0;
      const task = result.taskCount    || 0;
      showBanner(successBanner, 'success',
        `✓ Created ${proj} project${proj !== 1 ? 's' : ''} and ${task} task${task !== 1 ? 's' : ''} successfully!`);

      /* Reload cards with highlight */
      await loadProjects(true);

    } catch (err) {
      aiPanel.classList.remove('active');

      if (err.message === 'EMPTY_TRANSCRIPT') {
        showBanner(errorBanner, 'error', 'The transcript is empty. Please paste some content.');
      } else if (err.message && err.message.startsWith('UNRESOLVED_FIELDS:')) {
        /* Parse and display the unresolved fields list */
        try {
          const json = err.message.replace('UNRESOLVED_FIELDS:', '');
          const { fields } = JSON.parse(json);
          const listItems = fields.map(f => `<li>${esc(f)}</li>`).join('');
          showBanner(errorBanner, 'error',
            'The AI could not resolve some required fields. Please fix the transcript and retry:',
            `<ul class="error-fields">${listItems}</ul>`);
        } catch (parseErr) {
          showBanner(errorBanner, 'error', err.message);
        }
      } else {
        showBanner(errorBanner, 'error', err.message || 'An unexpected error occurred.');
      }

    } finally {
      /* Unlock UI */
      isProcessing             = false;
      createBtn.disabled       = false;
      loadSampleBtn.disabled   = false;
      clearBtn.disabled        = false;
      createBtn.textContent    = '✦ Create from Transcript';
    }
  });

  /* ---- Initial load ---- */
  loadProjects(false);

})();
