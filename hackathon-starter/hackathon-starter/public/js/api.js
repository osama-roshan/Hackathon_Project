/**
 * js/api.js — NovaWorks AI Project Manager
 * All network calls live here. Toggle USE_MOCK to switch between
 * mock data (for demos) and the real Express + Supabase backend.
 */

/* --------------------------------------------------------------------------
   Configuration
   -------------------------------------------------------------------------- */
const USE_MOCK = false;         // true = mock data, false = real backend
const API_BASE = '/api';        // must match Express route prefix

/* --------------------------------------------------------------------------
   Sample transcript — shown when admin clicks "Load Sample"
   -------------------------------------------------------------------------- */
const SAMPLE_TRANSCRIPT = `Meeting Notes — Project Kickoff
Date: 2026-10-01

We discussed three new client projects:

1. UrbanCart Clothing needs a full e-commerce website.
   Manager: Ayesha. Deadline: 2026-10-20.
   Tasks: product catalog UI (Ali, 12h), demo cart UI (Ali, 8h),
   product and cart APIs (Hamza, 14h), website integration (Ali, 6h).

2. QuickServe Services wants a mobile booking app.
   Manager: Bilal. Deadline: 2026-10-24.
   Tasks: login/profile screens (Sara, 8h), booking screens (Sara, 12h),
   booking APIs (Hamza, 16h), mobile integration (Usman, 10h).

3. HelpDeskPro Solutions needs an AI assistant.
   Manager: Hina. Deadline: 2026-10-22.
   Tasks: FAQ processing (Maryam, 10h), answer generation (Zain, 14h),
   escalation flow (Zain, 6h), evaluation (Maryam, 8h).`;

/* --------------------------------------------------------------------------
   Mock Data
   -------------------------------------------------------------------------- */

/* Users (password Demo123! for all) */
const MOCK_USERS = [
  { id: 'u1', name: 'Admin User',  email: 'admin@novaworks.example',   role: 'ADMIN',   specialization: 'Administration' },
  { id: 'u2', name: 'Ayesha Khan', email: 'ayesha@novaworks.example',  role: 'MANAGER', specialization: 'Web Projects' },
  { id: 'u3', name: 'Bilal Ahmed', email: 'bilal@novaworks.example',   role: 'MANAGER', specialization: 'Mobile Projects' },
  { id: 'u4', name: 'Hina Malik',  email: 'hina@novaworks.example',    role: 'MANAGER', specialization: 'AI Projects' },
  { id: 'u5', name: 'Ali Hassan',  email: 'ali@novaworks.example',     role: 'AGENT',   specialization: 'Frontend Dev' },
  { id: 'u6', name: 'Hamza Raza',  email: 'hamza@novaworks.example',   role: 'AGENT',   specialization: 'Backend Dev' },
  { id: 'u7', name: 'Sara Qureshi',email: 'sara@novaworks.example',    role: 'AGENT',   specialization: 'Mobile Dev' },
  { id: 'u8', name: 'Usman Tariq', email: 'usman@novaworks.example',   role: 'AGENT',   specialization: 'QA & Testing' },
  { id: 'u9', name: 'Zain Baig',   email: 'zain@novaworks.example',    role: 'AGENT',   specialization: 'AI Engineering' },
  { id: 'u10',name: 'Maryam Noor', email: 'maryam@novaworks.example',  role: 'AGENT',   specialization: 'Data & AI' },
];

/* Three projects with 12 tasks — stored in memory + sessionStorage */
const BASE_PROJECTS = [
  {
    id: 'p1',
    name: 'UrbanCart Website',
    clientName: 'UrbanCart Clothing',
    description: 'Full e-commerce website with product catalog, shopping cart, and payment integration.',
    deadline: '2026-10-20',
    manager: { id: 'u2', name: 'Ayesha Khan' },
    tasks: [
      { id: 't1', title: 'Product catalog UI',             description: 'Design and build the product listing and detail pages.',   assignee: { id: 'u5', name: 'Ali Hassan'   }, deadline: '2026-10-12', estimatedHours: 12 },
      { id: 't2', title: 'Demo cart UI',                   description: 'Shopping cart and checkout UI flow.',                       assignee: { id: 'u5', name: 'Ali Hassan'   }, deadline: '2026-10-15', estimatedHours: 8  },
      { id: 't3', title: 'Product and cart APIs',          description: 'REST APIs for products, cart, and orders.',                 assignee: { id: 'u6', name: 'Hamza Raza'   }, deadline: '2026-10-14', estimatedHours: 14 },
      { id: 't4', title: 'Website integration and testing',description: 'End-to-end integration and QA for the full website.',       assignee: { id: 'u5', name: 'Ali Hassan'   }, deadline: '2026-10-19', estimatedHours: 6  },
    ],
  },
  {
    id: 'p2',
    name: 'QuickServe Mobile App',
    clientName: 'QuickServe Services',
    description: 'Mobile app for service booking and account management on iOS and Android.',
    deadline: '2026-10-24',
    manager: { id: 'u3', name: 'Bilal Ahmed' },
    tasks: [
      { id: 't5', title: 'Login and profile screens',      description: 'Auth flow, profile view and edit screens.',                 assignee: { id: 'u7', name: 'Sara Qureshi' }, deadline: '2026-10-12', estimatedHours: 8  },
      { id: 't6', title: 'Service booking screens',        description: 'Browse, select and book a service UI.',                     assignee: { id: 'u7', name: 'Sara Qureshi' }, deadline: '2026-10-17', estimatedHours: 12 },
      { id: 't7', title: 'Booking and account APIs',       description: 'Backend APIs for bookings and user accounts.',              assignee: { id: 'u6', name: 'Hamza Raza'   }, deadline: '2026-10-16', estimatedHours: 16 },
      { id: 't8', title: 'Mobile integration and testing', description: 'Full integration, device testing and bug fixes.',           assignee: { id: 'u8', name: 'Usman Tariq'  }, deadline: '2026-10-22', estimatedHours: 10 },
    ],
  },
  {
    id: 'p3',
    name: 'HelpDeskPro AI Assistant',
    clientName: 'HelpDeskPro Solutions',
    description: 'AI-powered customer support assistant with FAQ ingestion and human escalation.',
    deadline: '2026-10-22',
    manager: { id: 'u4', name: 'Hina Malik' },
    tasks: [
      { id: 't9',  title: 'FAQ document processing',       description: 'Ingest and chunk FAQ documents into the vector store.',    assignee: { id: 'u10', name: 'Maryam Noor' }, deadline: '2026-10-13', estimatedHours: 10 },
      { id: 't10', title: 'Assistant answer generation',   description: 'LLM pipeline to answer support questions from FAQ data.',  assignee: { id: 'u9',  name: 'Zain Baig'   }, deadline: '2026-10-17', estimatedHours: 14 },
      { id: 't11', title: 'Human escalation flow',         description: 'Detect unresolved queries and route to a human agent.',    assignee: { id: 'u9',  name: 'Zain Baig'   }, deadline: '2026-10-18', estimatedHours: 6  },
      { id: 't12', title: 'Assistant evaluation and testing', description: 'Accuracy eval, edge-case testing and final demo prep.', assignee: { id: 'u10', name: 'Maryam Noor' }, deadline: '2026-10-21', estimatedHours: 8  },
    ],
  },
];

/* In-memory store — starts empty; filled after transcript creation */
let _mockProjects = [];

/* Persist projects across page refreshes */
function _loadMockProjects() {
  try {
    const stored = sessionStorage.getItem('nw_projects');
    if (stored) _mockProjects = JSON.parse(stored);
  } catch (e) { _mockProjects = []; }
}
function _saveMockProjects() {
  try { sessionStorage.setItem('nw_projects', JSON.stringify(_mockProjects)); } catch (e) {}
}
_loadMockProjects();

/** Short async delay for realism */
function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* --------------------------------------------------------------------------
   Internal helper — get current user from sessionStorage
   -------------------------------------------------------------------------- */
function _currentUser() {
  try { return JSON.parse(sessionStorage.getItem('nw_user') || 'null'); } catch (e) { return null; }
}

/* --------------------------------------------------------------------------
   MOCK implementations
   -------------------------------------------------------------------------- */
async function _mockLogin(email, password) {
  await _delay(600);
  const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || password !== 'Demo123!') {
    throw new Error('Invalid email or password.');
  }
  sessionStorage.setItem('nw_user', JSON.stringify(user));
  return { user };
}

async function _mockLogout() {
  await _delay(200);
  sessionStorage.removeItem('nw_user');
  sessionStorage.removeItem('nw_projects');
  return { ok: true };
}

async function _mockGetCurrentUser() {
  await _delay(200);
  const u = _currentUser();
  if (!u) throw new Error('Not authenticated');
  return u;
}

async function _mockGetProjects() {
  await _delay(500);
  const user = _currentUser();
  if (!user) throw new Error('Not authenticated');
  _loadMockProjects();
  if (user.role === 'ADMIN') return _mockProjects;
  if (user.role === 'MANAGER') return _mockProjects.filter(p => p.manager.id === user.id);
  // AGENT: return projects where they have at least one task
  return _mockProjects.filter(p => p.tasks.some(t => t.assignee.id === user.id));
}

async function _mockGetProjectById(id) {
  await _delay(400);
  const user = _currentUser();
  if (!user) throw new Error('Not authenticated');
  _loadMockProjects();
  const project = _mockProjects.find(p => p.id === id);
  if (!project) throw new Error('Project not found.');
  // Access control
  if (user.role === 'MANAGER' && project.manager.id !== user.id) throw new Error('ACCESS_DENIED');
  if (user.role === 'AGENT' && !project.tasks.some(t => t.assignee.id === user.id)) throw new Error('ACCESS_DENIED');
  return project;
}

async function _mockGetMyTasks() {
  await _delay(500);
  const user = _currentUser();
  if (!user) throw new Error('Not authenticated');
  _loadMockProjects();
  const result = [];
  for (const project of _mockProjects) {
    for (const task of project.tasks) {
      if (task.assignee.id === user.id) {
        result.push({ ...task, projectId: project.id, projectName: project.name, manager: project.manager });
      }
    }
  }
  return result;
}

async function _mockGetTeam() {
  await _delay(400);
  return MOCK_USERS;
}

async function _mockCreateFromTranscript(transcript) {
  // This function drives its own step-by-step progress via callback.
  // We return a Promise that resolves after all steps complete.
  // The caller passes an onStep callback.
  // Not called directly; see createFromTranscript below.
}

/* --------------------------------------------------------------------------
   Public API Functions
   -------------------------------------------------------------------------- */

/**
 * login(email, password) → { user }
 */
async function login(email, password) {
  if (USE_MOCK) return _mockLogin(email, password);
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed.');
  sessionStorage.setItem('nw_user', JSON.stringify(data.user));
  return data;
}

/**
 * logout() → { ok }
 */
async function logout() {
  if (USE_MOCK) return _mockLogout();
  const res = await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
  sessionStorage.removeItem('nw_user');
  sessionStorage.removeItem('nw_projects');
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Logout failed.'); }
  return { ok: true };
}

/**
 * getCurrentUser() → user object
 */
async function getCurrentUser() {
  if (USE_MOCK) return _mockGetCurrentUser();
  const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

/**
 * getProjects() → array of projects
 */
async function getProjects() {
  if (USE_MOCK) return _mockGetProjects();
  const res = await fetch(`${API_BASE}/projects`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load projects.');
  return data;
}

/**
 * getProjectById(id) → project object
 */
async function getProjectById(id) {
  if (USE_MOCK) return _mockGetProjectById(id);
  const res = await fetch(`${API_BASE}/projects/${id}`, { credentials: 'include' });
  const data = await res.json();
  if (res.status === 403) throw new Error('ACCESS_DENIED');
  if (!res.ok) throw new Error(data.error || 'Failed to load project.');
  return data;
}

/**
 * getMyTasks() → array of tasks (with project info)
 */
async function getMyTasks() {
  if (USE_MOCK) return _mockGetMyTasks();
  const res = await fetch(`${API_BASE}/my-tasks`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load tasks.');
  return data;
}

/**
 * getTeam() → array of users
 */
async function getTeam() {
  if (USE_MOCK) return _mockGetTeam();
  const res = await fetch(`${API_BASE}/team`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load team.');
  return data;
}

/**
 * createFromTranscript(transcript, onStep) → { projects, tasks }
 *
 * onStep(stepIndex, status) is called as each AI step progresses:
 *   status = 'doing' | 'done'
 * stepIndex: 0=Reading, 1=Finding, 2=Assigning, 3=Saving
 */
async function createFromTranscript(transcript, onStep) {
  if (!transcript || !transcript.trim()) {
    throw new Error('EMPTY_TRANSCRIPT');
  }

  if (USE_MOCK) {
    // Simulate AI processing with 4 visible steps
    const stepDelays = [1000, 1200, 1100, 1000]; // ms per step

    for (let i = 0; i < 4; i++) {
      onStep(i, 'doing');
      await _delay(stepDelays[i]);

      // Simulate error state if transcript contains the word "error"
      if (i === 1 && transcript.toLowerCase().includes('error')) {
        throw new Error('UNRESOLVED_FIELDS:{"fields":["client name for project 2","deadline for task 3","assignee for task 5"]}');
      }

      onStep(i, 'done');
    }

    // Store the projects in memory + sessionStorage
    _mockProjects = BASE_PROJECTS.map(p => ({ ...p, isNew: true }));
    _saveMockProjects();

    const totalTasks = _mockProjects.reduce((sum, p) => sum + p.tasks.length, 0);
    return { projectCount: _mockProjects.length, taskCount: totalTasks };
  }

  // Real backend — kick off fetch immediately but show animated steps on a timer.
  // Steps 0-1 advance while waiting; step 2 marks "assigning"; step 3 fires on save.
  onStep(0, 'doing');

  // Start the real API call in parallel with the animation
  const fetchPromise = fetch(`${API_BASE}/transcript`, {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify({ transcript }),
  });

  // Advance step 0 → done, step 1 → doing (while AI reads the transcript)
  await _delay(1800);
  onStep(0, 'done');
  onStep(1, 'doing');

  // Advance step 1 → done, step 2 → doing (while AI finds projects)
  await _delay(1800);
  onStep(1, 'done');
  onStep(2, 'doing');

  // Now await the actual server response
  const res  = await fetchPromise;
  const data = await res.json();

  if (!res.ok) {
    // Handle validation errors with unresolved fields list
    if (res.status === 422 && Array.isArray(data.unresolved)) {
      throw new Error('UNRESOLVED_FIELDS:' + JSON.stringify({ fields: data.unresolved }));
    }
    throw new Error(data.error || 'Transcript processing failed.');
  }

  // Step 2 done, step 3 fires for the "saving" moment
  onStep(2, 'done');
  onStep(3, 'doing');
  await _delay(400);
  onStep(3, 'done');

  return {
    projectCount: data.created?.projects ?? 0,
    taskCount:    data.created?.tasks    ?? 0,
  };
}
