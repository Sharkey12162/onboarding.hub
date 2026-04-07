// ============================================================
//  ONBOARDING HUB — app.js
// ============================================================

let supabase = null;
let currentView = 'dashboard';
let weeklyTasks = [];
let filterCategory = 'All';
let searchQuery = '';

// ---- STATIC DATA (from Excel) ----

const RESPONSIBILITIES = [
  {
    trigger: "New candidate applications available in Indeed under 'New' status.",
    title: "Screen New Candidates (Indeed)",
    timing: "Multiple times per month, as needed, based on hiring demand.",
    owner: "Brenda, Paula, Natalia",
    steps: [
      "Open Indeed → Go to Jobs (briefcase icon) → Select relevant job post → Focus on New applicants (oldest to newest).",
      "Verify the candidate is located within one hour of a major airport or major city. Confirm location using Google Maps.",
      "Review mandatory screener questions — candidate should ideally answer 'Yes' to all required questions.",
      "Confirm a resume is attached. Review experience: manual/hands-on work, HVAC experience, stable work history, adequate professional maturity.",
      "Review Status and Activity Fit on the right-hand panel. Check if the candidate applied to multiple job posts.",
      "If the candidate was previously rejected for another role → reject again to maintain consistency.",
      "If candidate does NOT meet criteria → Reject. If candidate meets criteria → select the Question Mark (?) icon next to their name."
    ],
    notes: "Pre-Interview Questions"
  },
  {
    trigger: "One week prior to remote orientation, after receiving Brenda's ORIENTATION email.",
    title: "Prepare & Send Consolidated Onboarding Checklists",
    timing: "One week prior to the scheduled remote orientation date.",
    owner: "Paula",
    steps: [
      "PRE-STEP: Confirm cell phone number and mailing address via Indeed messaging at the same time.",
      "Reply ALL to Brenda's ORIENTATION email.",
      "Create a checklist for each new technician in the orientation group.",
      "Verify digital onboarding is complete (confirmed in the New Hire Spreadsheet). If unclear, follow up with Lisa.",
      "Verify OSHA 10 or OSHA 30 Construction certificate is on file.",
      "Verify high school diploma, transcript, or GED certificate is on file.",
      "Indicate clearly on each checklist: what is completed vs. what is still pending prior to Day 1.",
      "Combine all individual checklists into one single email for that orientation group.",
      "Send the email to Brenda and the onboarding team."
    ],
    notes: "Train X on the pre-screening process and provide live support while she practices."
  },
  {
    trigger: "Friday morning before orientation week.",
    title: "Email Follow-Up — Update Onboarding Status via Reply All",
    timing: "Friday morning before the scheduled orientation week.",
    owner: "Paula",
    steps: [
      "Reply ALL to Brenda's original ORIENTATION email.",
      "Update onboarding status for each technician: confirm all checklist items completed, flag any items still pending.",
      "Include final status on: Digital onboarding completion, OSHA 10/30 certificate on file, Diploma/GED on file, any outstanding follow-ups with Lisa.",
      "This is the final status update before orientation week begins."
    ],
    notes: "Final check before orientation week. Ensure all onboarding items are resolved or clearly flagged as pending."
  },
  {
    trigger: "Monday of Orientation week.",
    title: "Send Orientation Link to Ana & Joe for IT Onboarding + Set up Meet & Greet",
    timing: "Monday of Orientation week.",
    owner: "Paula",
    steps: [
      "Send Orientation link to Ana for IT Onboarding: Post the link in the Onboarding Thread in RC, then set up a 1-hour placeholder in Outlook Calendar.",
      "Set up Meet & Greet with the ATA Team: Participants: Brian, Brenda, Techs, Paula. Use the same Orientation link.",
      "Check calendars and try to schedule the Meet & Greet for Wednesday of that week."
    ],
    notes: "Meet & Greet: try to schedule on Wednesday. Check team availability."
  },
  {
    trigger: "ORIENTATION – Once Brenda confirms in the Onboarding thread that the new technician's RC account is active and working.",
    title: "Add New Team Members to RC Threads, Create TEAM, Set Up Recurring Meetings",
    timing: "As soon as Brenda confirms the RC account is active in the Onboarding thread.",
    owner: "Paula",
    steps: [
      "Add the new technician to: Company Social RC Thread, Field Tech Resources RC Thread, Training Touch Base / BZ Info Thread, Competition GROUP RC Thread.",
      "Create their TEAM: Include the assigned PM, Lead Tech (Brenda), and the new technician.",
      "Add the new technician to all recurring meetings.",
      "Post a message in the Orientation thread confirming all steps above are complete.",
      "Ask the new technician to confirm attendance for the scheduled meetings."
    ],
    notes: "Recurring meetings: New Tech Update (Wednesdays), TTB (Thursdays). ⚠ If the technician is a SURVEY tech, do NOT add them to the Wednesday meeting."
  }
];

const ORIENTATION_PHASES = [
  {
    title: "PHASE 1: PRE-ORIENTATION PREP (NOW – May 11)",
    tasks: [
      { date: "Ongoing", timeframe: "As needed", name: "Screen New Candidates (Indeed)", steps: "1) Review New applicants (oldest → newest)\n2) Verify location within 1 hr of major airport/city\n3) Check screener questions (all \"Yes\")\n4) Resume review: manual/HVAC exp, stable work history\n5) Check Indeed indicators & prior rejections\n6) Reject or mark with (?) for next step", owner: "Brenda, Paula, Natalia", notes: "Pre-interview questions as needed" },
      { date: "Ongoing", timeframe: "As needed", name: "Conduct Pre-Screening Interviews", steps: "Shadow/conduct pre-screening interviews for qualified candidates. Check Brenda's calendar for interview links.", owner: "Natalia & Paula", notes: "Focus on DFW and active pipeline" },
      { date: "Ongoing", timeframe: "As candidates are hired", name: "Ensure Candidate Documentation is Complete", steps: "1) Confirm digital onboarding is complete (New Hire Spreadsheet)\n2) Verify OSHA 10/30 Construction certificate on file\n3) Verify high school diploma/transcript/GED on file\n4) Upload docs to SharePoint (OSHA folder & Education folder)\n5) Follow up with Lisa if completion status is unclear", owner: "Paula", notes: "Docs requested after offer letter via Indeed messages" },
      { date: "Mon, May 4", timeframe: "May 4", name: "Confirm Cell Phone Numbers & Mailing Addresses", steps: "Via Indeed messaging, confirm each candidate's:\n• Cell phone number\n• Current mailing address", owner: "Paula / Natalia", notes: "Do this at the same time as address confirmation" },
      { date: "Wed, May 6", timeframe: "May 6", name: "Follow Up on Any Missing Documents", steps: "Check for any outstanding OSHA, Diploma/GED, or digital onboarding items. Follow up directly with candidates or Lisa.", owner: "Paula", notes: "Ensure everything is on track before checklist prep" },
      { date: "Fri, May 8", timeframe: "May 8", name: "Update Office Calendar & Anniversary Tracker", steps: "Add all May 19 orientation hires to:\n1) Office Calendar (Outlook)\n2) Anniversary/Birthday Tracker spreadsheet", owner: "Natalia", notes: "" }
    ]
  },
  {
    title: "PHASE 2: ONE WEEK BEFORE ORIENTATION (May 11 – May 15)",
    tasks: [
      { date: "Mon, May 11", timeframe: "May 11", name: "Prepare & Send Consolidated Onboarding Checklists", steps: "1) Reply ALL to Brenda's ORIENTATION email\n2) Create a checklist for each new technician:\n   • Digital onboarding complete? (check New Hire Spreadsheet)\n   • OSHA 10/30 certificate on file?\n   • Diploma/GED on file?\n3) Mark what is completed vs. still pending\n4) Combine all checklists into ONE email\n5) Send to Brenda and onboarding team", owner: "Paula", notes: "One week prior to orientation — triggered by Brenda's ORIENTATION email" },
      { date: "Tue, May 12", timeframe: "May 12", name: "Prepare ATA Enrollment Materials", steps: "1) Prepare Airadigm Technical Academy accounts (Airadigm emails)\n2) Identify courses for enrollment: Basics, ATA Getting Started, Safety\n3) Prepare individual Digital ATA Scores spreadsheets (Last, First format)", owner: "Paula / Natalia", notes: "Techs will be enrolled on Day 1 of orientation" },
      { date: "Wed, May 13", timeframe: "May 13", name: "Review OSHA & Diploma Certifications (Final Check)", steps: "Final verification that all documentation is uploaded to SharePoint:\n• OSHA 10 & 30 Cards - Certificates folder (by region)\n• Tech Education Certs folder (Last, First format)", owner: "Natalia", notes: "Last chance before orientation week" },
      { date: "Fri, May 15", timeframe: "May 15", name: "Update Onboarding Status (Reply All)", steps: "Friday before orientation — update onboarding status via Reply All to Brenda's original orientation email. Confirm all items completed or flag pending items.", owner: "Paula", notes: "Final status update before orientation week" }
    ]
  },
  {
    title: "PHASE 3: ORIENTATION WEEK (May 18 – May 22)",
    tasks: [
      { date: "Mon, May 18", timeframe: "May 18", name: "Send Orientation Link to Ana & Joe (IT Onboarding)", steps: "1) Post Orientation link in the Onboarding Thread in RC\n2) Set up 1-hour placeholder in Outlook Calendar\n3) Send link to Ana for IT Onboarding", owner: "Paula", notes: "" },
      { date: "Mon, May 18", timeframe: "May 18", name: "Schedule Meet & Greet with ATA Team", steps: "1) Schedule Meet & Greet: Brian, Brenda, Techs, Paula\n2) Use the same Orientation link\n3) Check calendars — target Wednesday May 20\n4) Send calendar invite", owner: "Paula", notes: "Try to schedule for Wednesday of orientation week" },
      { date: "⭐ Tue, May 19", timeframe: "May 19", name: "⭐ ORIENTATION DAY", steps: "Orientation takes place. Observe/support as needed.\n• Tools testing observation (8:15 AM EST with Ana)\n• IT Onboarding session\n• Enroll technicians in ATA courses (Basics, Getting Started, Safety)\n• Create individual ATA tracking spreadsheets", owner: "Brenda, Paula, Natalia", notes: "Key milestone day — all prep should be complete" },
      { date: "Tue, May 19", timeframe: "May 19", name: "Create Tracking Spreadsheets for New Hires", steps: "Create individual spreadsheets for each new technician who attended orientation (Digital ATA Scores format).", owner: "Paula", notes: "Save to SharePoint: Digital ATA Scores folder" }
    ]
  },
  {
    title: "PHASE 4: POST-ORIENTATION / RC & SYSTEMS SETUP (May 19 – May 22)",
    tasks: [
      { date: "May 19–20", timeframe: "Once RC account is active", name: "Add New Techs to RC Threads", steps: "Once Brenda confirms RC account is active, add new technicians to:\n1) Company Social RC Thread\n2) Field Tech Resources RC Thread\n3) Training Touch Base / BZ Info Thread\n4) Competition GROUP RC Thread", owner: "Paula", notes: "Wait for Brenda's confirmation in Onboarding thread" },
      { date: "May 19–20", timeframe: "Once RC account is active", name: "Create TEAM & Add to Recurring Meetings", steps: "1) Create TEAM: assigned PM + Lead Tech (Brenda) + new tech\n2) Add new tech to recurring meetings:\n   • New Tech Update (Wednesdays)\n   • TTB (Thursdays)\n3) Post confirmation in Orientation thread\n4) Ask new tech to confirm meeting attendance\n\n⚠ If SURVEY tech → do NOT add to Wednesday meeting", owner: "Paula", notes: "Survey techs excluded from New Tech Update (Wed)" },
      { date: "May 20–22", timeframe: "Post-Orientation week", name: "Update Onboarding Information in Systems", steps: "Update records in:\n• WEX\n• USA Balancing\n• QAD (coordinate with Lisa for missing info)", owner: "Natalia", notes: "Follow up with Lisa on any missing QAD info" },
      { date: "May 20–22", timeframe: "Post-Orientation week", name: "Update Maps Group", steps: "Add new technicians to the AirSolutions & Balancing Employee Location Map (Google My Maps).", owner: "Natalia", notes: "" }
    ]
  },
  {
    title: "PHASE 5: ONGOING TRAINING TRACKING (May 22 – Jun 12)",
    tasks: [
      { date: "Every Monday", timeframe: "Weekly", name: "Update ATA Hours Report", steps: "1) Collect weekly timelog data from PM assistants (ATA Training Cost - WEEKLY REPORTS)\n2) Paste training hours into TIMELOGS TRAINING sheet\n3) Verify compliance with 2-hour weekly guideline\n4) Flag any exceptions", owner: "Paula", notes: "Data shared by PM assistants in ATA Training Cost thread" },
      { date: "Every Friday", timeframe: "Weekly", name: "Review ATA Lesson Progress", steps: "1) Review ATA Progress sheet (color-coded: green/yellow/blue)\n2) Update individual Digital ATA Scores spreadsheets\n3) Identify techs who are behind\n4) Document PM approval where applicable", owner: "Paula", notes: "Use Airadigm Technical Academy admin dashboard" },
      { date: "Weekly", timeframe: "Ongoing", name: "Attend Recurring Meetings", steps: "• New Tech Update (Wednesdays)\n• Training Touch Base / TTB (Thursdays)", owner: "Paula", notes: "" }
    ]
  },
  {
    title: "PHASE 6: BOOTCAMP PREP (Jun 8 – Jun 15)",
    tasks: [
      { date: "Mon, Jun 8", timeframe: "Jun 8", name: "Verify All ATA Enrollment & Progress", steps: "Confirm all May 19 orientation hires are enrolled and progressing in ATA courses before bootcamp. Flag anyone behind to PM.", owner: "Paula / Natalia", notes: "One week before bootcamp" },
      { date: "Wed, Jun 10", timeframe: "Jun 10", name: "Send Pre-Bootcamp Questionnaire", steps: "Send questionnaire/survey to new technicians in preparation for bootcamp.", owner: "Brenda / Paula", notes: "Coordinate with Brenda on timing" },
      { date: "Fri, Jun 12", timeframe: "Jun 12", name: "Final Documentation & Systems Check", steps: "1) All OSHA/Diploma docs uploaded to SharePoint\n2) ATA tracking spreadsheets current\n3) RC threads and meetings confirmed\n4) Office Calendar & Anniversary Tracker updated\n5) Onboarding info in WEX/USA B/QAD complete", owner: "Paula / Natalia", notes: "Final check before bootcamp" },
      { date: "⭐ Mon, Jun 15", timeframe: "Jun 15", name: "⭐ BOOTCAMP BEGINS", steps: "Bootcamp starts. Ensure all new technicians are fully set up and tracking is in place.", owner: "Brenda", notes: "Key milestone — all onboarding should be complete" }
    ]
  }
];

const LINKS_DATA = [
  { category: "Hiring / Onboarding", name: "New Hire Checklist", description: "Centralized checklist with detailed info for each new hire (office and field staff). Used to track onboarding completion and access required information.", link: "New hire checklist - Updated File Sept. 2025.xlsx" },
  { category: "Hiring / Onboarding", name: "Diploma / GED / OSHA List", description: "Confirms whether each technician has submitted required documents: OSHA 10/30 and Diploma or GED. Required for NEBB exam eligibility.", link: "Diploma_GED_OSHA List.xlsx" },
  { category: "Hiring / Onboarding", name: "OSHA 10 & 30 Cards – SharePoint", description: "SharePoint location for storing OSHA 10 and OSHA 30 cards/certificates, organized by region. Stores actual documents (not just Yes/No status).", link: "company documents - Documents - OSHA 10 & 30 Cards - Certificates - All Documents" },
  { category: "Hiring / Onboarding", name: "Tech Education Certs (SharePoint)", description: "SharePoint location for technicians' education documents (Diploma, GED, transcripts). Files saved as LastName, FirstName. Required for certification.", link: "High School or GED Diplomas - OneDrive" },
  { category: "ATA / Training", name: "ATA Progress Since Feb 2025 (ATA Hours Sheet)", description: "Tracks technician training hours by region, including start date and tenure. Reviewed every Monday using data shared by PM assistants.", link: "ATA progress since Feb 2025.xlsx" },
  { category: "ATA / Training", name: "ATA Progress (TIMELOGS TRAINING Sheet)", description: "Sheet used to paste training hours each technician punches under the Training Cost Code. Updated every Monday.", link: "ATA progress since Feb 2025.xlsx" },
  { category: "ATA / Training", name: "ATA Progress (Progress Sheet)", description: "Tracks ATA lesson status using color coding (green, yellow, blue). Reviewed and updated every Friday.", link: "ATA progress since Feb 2025.xlsx" },
  { category: "ATA / Training", name: "Airadigm Technical Academy", description: "Training platform where technicians complete ATA lessons. Technicians enrolled on Day 1 of orientation. Lesson progress reviewed every Friday.", link: "https://joe-balancer.teachable.com/admin/dashboard" },
  { category: "ATA / Training", name: "Digital ATA Scores", description: "SharePoint location with individual spreadsheets for each technician (Last Name, First Name – Digital ATA Scores). Created at orientation start, updated every Friday.", link: "Digital ATA Scores" }
];

const INITIAL_WEEKLY = [
  { id: 1, task: "Onboarding Courses x Solvo", owner: "Natalia", due: "2026-02-09", status: "Completed", priority: "Medium", category: "Training", resources: "Solvo University", notes: "" },
  { id: 2, task: "ATA Hours Report", owner: "Paula", due: "2026-02-09", status: "Not started", priority: "High", category: "Training", resources: "ATA Training Cost Codes Thread", notes: "" },
  { id: 3, task: "Follow up about Careers Inbox", owner: "Paula", due: "2026-02-09", status: "Completed", priority: "Medium", category: "Hiring", resources: "Ring Central", notes: "Pending - follow up message sent to Jean" },
  { id: 4, task: "ATA Report", owner: "Paula", due: "2026-02-09", status: "Completed", priority: "Urgent", category: "Training", resources: "Admin", notes: "" },
  { id: 5, task: "ATA Self Assessment Results Analysis", owner: "Paula", due: "2026-02-09", status: "In progress", priority: "Urgent", category: "Training", resources: "TAB Skills Self-Assessment", notes: "Still working on it — missing a few SW techs and RM areas." },
  { id: 6, task: "Tool List Justin Bowman", owner: "Natalia", due: "2026-02-09", status: "Completed", priority: "Urgent", category: "Hiring", resources: "USA Balancing", notes: "" },
  { id: 7, task: "Pre-Interviews Shadowing", owner: "Natalia", due: "2026-02-09", status: "Completed", priority: "High", category: "Hiring", resources: "Indeed job post", notes: "Check Brenda's Calendar for links" },
  { id: 8, task: "Orientation – Tools Testing", owner: "Natalia", due: "2026-02-10", status: "Completed", priority: "High", category: "Orientation", resources: "Location/Link", notes: "Observe Ana 8:15 AM EST" },
  { id: 9, task: "Natalia's Access to Diploma & OSHA SharePoints", owner: "Paula (Lisa)", due: "2026-02-10", status: "Completed", priority: "Medium", category: "Hiring", resources: "Links shared on RC to Natalia", notes: "" },
  { id: 10, task: "Meeting with James", owner: "Natalia", due: "2026-02-12", status: "Completed", priority: "Medium", category: "Meetings", resources: "", notes: "Ask if we can create a shared email to receive notifications from Indeed" },
  { id: 11, task: "Justin Holton – User Creation", owner: "Natalia", due: "2026-02-12", status: "Completed", priority: "Medium", category: "Hiring", resources: "QAD", notes: "Users creation" },
  { id: 12, task: "Friday Before Orientation – Update Onboarding Status via Reply All", owner: "Paula", due: "2026-02-13", status: "Not started", priority: "Medium", category: "Orientation", resources: "Email", notes: "Reply all to Brenda's original orientation email." },
  { id: 13, task: "Office Calendar Review", owner: "Natalia", due: "2026-02-13", status: "Completed", priority: "Medium", category: "Hiring", resources: "", notes: "People that started Feb 10 need to be added" },
  { id: 14, task: "Anniversary Tracker Review", owner: "Natalia", due: "2026-02-13", status: "Completed", priority: "Medium", category: "Hiring", resources: "", notes: "People that started Feb 10 need to be added" },
  { id: 15, task: "Fireflies Access", owner: "Natalia and Paula", due: "2026-02-16", status: "In progress", priority: "High", category: "Meetings", resources: "Fireflies", notes: "Access requested" },
  { id: 16, task: "Indeed Messages Update", owner: "Natalia", due: "2026-02-17", status: "In progress", priority: "High", category: "Hiring", resources: "Indeed", notes: "Level 2 and Level 3" },
  { id: 17, task: "Maps Group Update", owner: "Natalia", due: "2026-02-17", status: "Not started", priority: "High", category: "Hiring", resources: "AirSolutions & Balancing - Employee Location Map - Google My Maps", notes: "Justin Holton & Justin Bowman" },
  { id: 18, task: "Pre-Screening", owner: "Natalia", due: "2026-02-18", status: "In progress", priority: "Medium", category: "Hiring", resources: "Indeed job post", notes: "Focus on DFW" },
  { id: 19, task: "Onboarding Information Update", owner: "Natalia", due: "2026-02-18", status: "Not started", priority: "High", category: "Orientation", resources: "", notes: "WEX, USA B, QAD (Missing information from Lisa)" }
];

// ---- SUPABASE CONFIG ----

function getConfig() {
  try {
    const cfg = JSON.parse(localStorage.getItem('onboarding_cfg') || '{}');
    return cfg;
  } catch { return {}; }
}

function saveConfig() {
  const url = document.getElementById('setup-url').value.trim();
  const key = document.getElementById('setup-key').value.trim();
  const status = document.getElementById('setup-status');

  if (!url || !key) {
    status.textContent = 'Please enter both URL and key.';
    status.className = 'setup-status error';
    return;
  }

  status.textContent = 'Connecting...';
  status.className = 'setup-status';

  localStorage.setItem('onboarding_cfg', JSON.stringify({ url, key }));
  initSupabase(url, key).then(ok => {
    if (ok) {
      status.textContent = '✓ Connected! Loading app...';
      status.className = 'setup-status success';
      setTimeout(() => showApp(), 700);
    } else {
      status.textContent = '✗ Could not connect. Check your credentials.';
      status.className = 'setup-status error';
    }
  });
}

function resetConfig() {
  if (confirm('Reset Supabase connection? You will need to re-enter your credentials.')) {
    localStorage.removeItem('onboarding_cfg');
    location.reload();
  }
}

async function initSupabase(url, key) {
  try {
    supabase = window.supabase.createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    // Always return true — connection errors handled later per operation
    return true;
  } catch (e) {
    console.error('Supabase init error:', e);
    return false;
  }
}

async function createTablesIfNeeded() {
  // Use SQL to create tables
  try {
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS weekly_tasks (
          id BIGSERIAL PRIMARY KEY,
          task TEXT NOT NULL,
          owner TEXT,
          due DATE,
          status TEXT DEFAULT 'Not started',
          priority TEXT DEFAULT 'Medium',
          category TEXT,
          resources TEXT,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS orientation_checks (
          id TEXT PRIMARY KEY,
          checked BOOLEAN DEFAULT FALSE,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS step_checks (
          id TEXT PRIMARY KEY,
          checked BOOLEAN DEFAULT FALSE,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
  } catch (e) {
    // rpc might not exist; tables might already exist — that's fine
  }
}

async function ensureWeeklyData() {
  const { data, error } = await supabase.from('weekly_tasks').select('id').limit(1);
  if (error || !data || data.length === 0) {
    // Insert initial data
    const rows = INITIAL_WEEKLY.map(t => ({
      task: t.task, owner: t.owner, due: t.due,
      status: t.status, priority: t.priority, category: t.category,
      resources: t.resources, notes: t.notes
    }));
    await supabase.from('weekly_tasks').insert(rows);
  }
}

// ---- APP INIT ----

async function showApp() {
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('main-content').innerHTML += ''; // trigger repaint

  await createTablesIfNeeded();
  await loadWeeklyTasks();
  renderDashboard();
  renderOrientationView();
  renderResponsibilities();
  renderLinks();
  renderFilterBar();
}

window.addEventListener('DOMContentLoaded', async () => {
  const cfg = getConfig();
  if (cfg.url && cfg.key) {
    const ok = await initSupabase(cfg.url, cfg.key);
    if (ok) {
      showApp();
    } else {
      showSetup();
    }
  } else {
    showSetup();
  }
});

function showSetup() {
  document.getElementById('setup-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

// ---- WEEKLY TASKS ----

async function loadWeeklyTasks() {
  const { data, error } = await supabase
    .from('weekly_tasks')
    .select('*')
    .order('due', { ascending: true });

  if (error) {
    // Fallback to local
    weeklyTasks = [...INITIAL_WEEKLY];
  } else {
    weeklyTasks = data && data.length > 0 ? data : [...INITIAL_WEEKLY];
    if (!data || data.length === 0) await ensureWeeklyData();
  }
  renderWeeklyBoard();
}

async function updateTaskStatus(id, newStatus) {
  weeklyTasks = weeklyTasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
  await supabase.from('weekly_tasks').update({ status: newStatus }).eq('id', id);
  renderWeeklyBoard();
  renderDashboard();
}

async function saveTask() {
  const task = document.getElementById('task-name').value.trim();
  if (!task) { showToast('Please enter a task name.', 'error'); return; }

  const row = {
    task,
    owner: document.getElementById('task-owner').value.trim(),
    due: document.getElementById('task-due').value || null,
    status: 'Not started',
    priority: document.getElementById('task-priority').value,
    category: document.getElementById('task-category').value,
    notes: document.getElementById('task-notes').value.trim(),
    resources: document.getElementById('task-resources').value.trim()
  };

  const { data, error } = await supabase.from('weekly_tasks').insert([row]).select();
  if (error) {
    showToast('Error saving task.', 'error');
    return;
  }
  weeklyTasks.push(data[0]);
  closeAddTask();
  renderWeeklyBoard();
  renderDashboard();
  showToast('Task added!', 'success');
}

// ---- ORIENTATION CHECKS ----

async function getOrientCheck(id) {
  try {
    const { data } = await supabase.from('orientation_checks').select('checked').eq('id', id).single();
    return data?.checked || false;
  } catch { return false; }
}

async function toggleOrientCheck(id, el) {
  const current = el.classList.contains('checked');
  el.classList.toggle('checked', !current);
  el.closest('.orient-task').classList.toggle('done', !current);
  try {
    await supabase.from('orientation_checks').upsert({ id, checked: !current, updated_at: new Date().toISOString() });
  } catch(e) { console.warn(e); }
  updateOrientationProgress();
}

// ---- STEP CHECKS ----

async function toggleStepCheck(id, el) {
  const current = el.classList.contains('done');
  el.classList.toggle('done', !current);
  const txt = el.nextElementSibling;
  if (txt) txt.classList.toggle('done', !current);
  const cb = el.previousElementSibling;
  if (cb) { cb.classList.toggle('done', !current); }
  try {
    await supabase.from('step_checks').upsert({ id, checked: !current, updated_at: new Date().toISOString() });
  } catch(e) { console.warn(e); }
}

// ---- RENDER DASHBOARD ----

function renderDashboard() {
  const tasks = weeklyTasks;
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'Completed').length;
  const inProg = tasks.filter(t => t.status === 'In progress').length;
  const notStarted = tasks.filter(t => t.status === 'Not started').length;
  const urgent = tasks.filter(t => t.priority === 'Urgent' || t.priority === 'High').length;

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Total Tasks</div></div>
    <div class="stat-card green"><div class="stat-value">${done}</div><div class="stat-label">Completed</div></div>
    <div class="stat-card gold"><div class="stat-value">${inProg}</div><div class="stat-label">In Progress</div></div>
    <div class="stat-card red"><div class="stat-value">${notStarted}</div><div class="stat-label">Not Started</div></div>
  `;

  // Urgent list
  const urgentTasks = tasks.filter(t => (t.priority === 'Urgent' || t.priority === 'High') && t.status !== 'Completed').slice(0, 6);
  document.getElementById('urgent-list').innerHTML = urgentTasks.length
    ? urgentTasks.map(t => `
        <div class="task-mini ${t.priority.toLowerCase()}" onclick="switchView('weekly',null)">
          <span class="task-mini-name">${t.task}</span>
          <span class="task-mini-owner">${t.owner || ''}</span>
        </div>`).join('')
    : '<div class="empty-state">🎉 No urgent tasks!</div>';

  // Upcoming orientation
  const orientTasks = ORIENTATION_PHASES.flatMap(p => p.tasks).slice(0, 5);
  document.getElementById('upcoming-list').innerHTML = orientTasks.map(t => `
    <div class="task-mini" onclick="switchView('orientation',null)">
      <span class="task-mini-name">${t.name}</span>
      <span class="task-mini-owner">${t.date}</span>
    </div>`).join('');
}

// ---- RENDER WEEKLY BOARD ----

function renderWeeklyBoard() {
  const statuses = ['Not started', 'In progress', 'Completed'];
  const filtered = weeklyTasks.filter(t => {
    const catMatch = filterCategory === 'All' || t.category === filterCategory;
    const searchMatch = !searchQuery || t.task.toLowerCase().includes(searchQuery) || (t.owner || '').toLowerCase().includes(searchQuery);
    return catMatch && searchMatch;
  });

  document.getElementById('weekly-board').innerHTML = statuses.map(status => {
    const col = filtered.filter(t => t.status === status);
    return `
      <div class="kanban-col">
        <div class="kanban-col-header">
          <h4>${status}</h4>
          <span class="col-count">${col.length}</span>
        </div>
        ${col.map(t => taskCard(t)).join('') || '<div class="empty-state" style="font-size:12px;padding:20px">No tasks</div>'}
      </div>`;
  }).join('');
}

function taskCard(t) {
  const pri = (t.priority || 'medium').toLowerCase();
  const cat = (t.category || '').toLowerCase();
  const isComplete = t.status === 'Completed';
  return `
    <div class="task-card ${pri}">
      <div class="task-checkbox ${isComplete ? 'checked' : ''}" onclick="cycleStatus(${t.id}, event)"></div>
      <div class="task-card-title">${t.task}</div>
      <div class="task-card-meta">
        <span class="tag ${pri}">${t.priority || 'Medium'}</span>
        ${t.category ? `<span class="tag ${cat}">${t.category}</span>` : ''}
        <span class="task-owner">${t.owner || ''}</span>
        ${t.due ? `<span class="task-due">📅 ${formatDate(t.due)}</span>` : ''}
      </div>
      ${t.notes ? `<div style="margin-top:8px;font-size:11px;color:var(--text-muted);line-height:1.4">${t.notes}</div>` : ''}
    </div>`;
}

function cycleStatus(id, e) {
  e.stopPropagation();
  const task = weeklyTasks.find(t => t.id === id);
  if (!task) return;
  const order = ['Not started', 'In progress', 'Completed'];
  const next = order[(order.indexOf(task.status) + 1) % order.length];
  updateTaskStatus(id, next);
  showToast(`Task marked: ${next}`);
}

// ---- RENDER ORIENTATION ----

function renderOrientationView() {
  const container = document.getElementById('orientation-phases');
  container.innerHTML = ORIENTATION_PHASES.map((phase, pi) => `
    <div class="phase-section">
      <div class="phase-title">${phase.title}</div>
      ${phase.tasks.map((task, ti) => {
        const id = `orient-${pi}-${ti}`;
        return `
          <div class="orient-task" id="task-${id}">
            <div class="orient-check" id="check-${id}" onclick="toggleOrientCheck('${id}', this)"></div>
            <div class="orient-task-body">
              <div class="orient-task-name">${task.name}</div>
              <div class="orient-task-meta">
                <span class="orient-date">📅 ${task.date}</span>
                <span class="orient-owner">👤 ${task.owner}</span>
                <span class="expand-btn" onclick="toggleOrientSteps('${id}', event)">▼ Steps</span>
              </div>
              <div class="orient-steps" id="steps-${id}">${task.steps}${task.notes ? '\n\n📝 ' + task.notes : ''}</div>
            </div>
          </div>`;
      }).join('')}
    </div>`).join('');

  // Load saved checks
  loadOrientChecks();
  updateOrientationProgress();
}

async function loadOrientChecks() {
  try {
    const { data } = await supabase.from('orientation_checks').select('*');
    if (data) {
      data.forEach(row => {
        if (row.checked) {
          const el = document.getElementById(`check-${row.id}`);
          if (el) {
            el.classList.add('checked');
            el.closest('.orient-task')?.classList.add('done');
          }
        }
      });
    }
  } catch(e) { console.warn('Could not load orient checks', e); }
  updateOrientationProgress();
}

function toggleOrientSteps(id, e) {
  e.stopPropagation();
  const steps = document.getElementById(`steps-${id}`);
  steps.classList.toggle('open');
  const btn = e.target;
  btn.textContent = steps.classList.contains('open') ? '▲ Steps' : '▼ Steps';
}

function updateOrientationProgress() {
  const checks = document.querySelectorAll('.orient-check');
  const done = document.querySelectorAll('.orient-check.checked');
  const total = checks.length;
  const pct = total > 0 ? Math.round((done.length / total) * 100) : 0;
  document.getElementById('orientation-progress-bar').innerHTML = `
    <div class="progress-bar-fill" style="width:${pct}%"></div>`;
}

// ---- RENDER RESPONSIBILITIES ----

function renderResponsibilities() {
  const container = document.getElementById('responsibilities-list');
  container.innerHTML = RESPONSIBILITIES.map((r, i) => `
    <div class="proc-card" id="proc-${i}">
      <div class="proc-header" onclick="toggleProc(${i})">
        <div class="proc-num">${i + 1}</div>
        <div class="proc-trigger">
          <div class="proc-trigger-label">Trigger / Cue</div>
          <div class="proc-trigger-text">${r.trigger}</div>
        </div>
        <div class="proc-meta">
          <span class="tag hiring">${r.owner}</span>
          <span class="proc-arrow">▶</span>
        </div>
      </div>
      <div class="proc-body">
        <div class="proc-section">
          <div class="proc-section-label">Responsibility</div>
          <div style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:4px">${r.title}</div>
        </div>
        <div class="proc-section">
          <div class="proc-section-label">Step-by-Step Action</div>
          <ul class="proc-steps-checklist">
            ${r.steps.map((s, si) => `
              <li onclick="toggleStepCheck('proc-${i}-step-${si}', this)">
                <div class="step-cb" id="scb-proc-${i}-step-${si}"></div>
                <span class="step-text" id="stxt-proc-${i}-step-${si}">${s}</span>
              </li>`).join('')}
          </ul>
        </div>
        <div class="proc-section">
          <div class="proc-section-label">Timing</div>
          <div class="proc-steps">${r.timing}</div>
        </div>
        ${r.notes ? `<div class="proc-section"><div class="proc-section-label">Notes</div><div class="proc-steps">${r.notes}</div></div>` : ''}
      </div>
    </div>`).join('');
  loadStepChecks();
}

async function loadStepChecks() {
  try {
    const { data } = await supabase.from('step_checks').select('*');
    if (data) {
      data.forEach(row => {
        if (row.checked) {
          const cb = document.getElementById(`scb-${row.id}`);
          const txt = document.getElementById(`stxt-${row.id}`);
          if (cb) cb.classList.add('done');
          if (txt) txt.classList.add('done');
        }
      });
    }
  } catch(e) { console.warn('Could not load step checks', e); }
}

function toggleStepCheck(id, li) {
  const cb = li.querySelector('.step-cb');
  const txt = li.querySelector('.step-text');
  const current = cb.classList.contains('done');
  cb.classList.toggle('done', !current);
  txt.classList.toggle('done', !current);
  try {
    supabase.from('step_checks').upsert({ id, checked: !current, updated_at: new Date().toISOString() });
  } catch(e) {}
}

function toggleProc(i) {
  document.getElementById(`proc-${i}`).classList.toggle('open');
}

// ---- RENDER LINKS ----

function renderLinks() {
  const q = searchQuery;
  const filtered = LINKS_DATA.filter(l =>
    !q || l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
  );
  document.getElementById('links-grid').innerHTML = filtered.map(l => {
    const isUrl = l.link.startsWith('http');
    return `
      <div class="link-card">
        <div class="link-category">${l.category}</div>
        <div class="link-name">${l.name}</div>
        <div class="link-desc">${l.description}</div>
        ${isUrl
          ? `<a class="link-url" href="${l.link}" target="_blank" rel="noopener">🔗 Open Resource</a>`
          : `<span class="link-url">📄 ${l.link}</span>`}
      </div>`;
  }).join('') || '<div class="empty-state">No resources match your search.</div>';
}

// ---- FILTER BAR ----

function renderFilterBar() {
  const cats = ['All', 'Hiring', 'Training', 'Orientation', 'Meetings'];
  document.getElementById('weekly-filters').innerHTML = cats.map(c => `
    <span class="pill ${filterCategory === c ? 'active' : ''}" onclick="setFilter('${c}')">${c}</span>`).join('');
}

function setFilter(cat) {
  filterCategory = cat;
  renderFilterBar();
  renderWeeklyBoard();
}

// ---- SEARCH ----

function handleSearch(val) {
  searchQuery = val.toLowerCase().trim();
  if (currentView === 'weekly') renderWeeklyBoard();
  if (currentView === 'links') renderLinks();
}

// ---- NAVIGATION ----

function switchView(view, btn) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else document.querySelector(`[data-view="${view}"]`)?.classList.add('active');

  const titles = { dashboard: 'Dashboard', weekly: 'Weekly Tasks', orientation: 'May 2026 Orientation', responsibilities: 'Responsibilities', links: 'Resources & Links' };
  document.getElementById('view-title').textContent = titles[view] || view;

  // Clear search on view change
  document.getElementById('search-input').value = '';
  searchQuery = '';

  if (view === 'weekly') renderWeeklyBoard();
  if (view === 'links') renderLinks();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ---- MODAL ----

function openAddTask() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('task-name').focus();
}

function closeAddTask() {
  document.getElementById('modal-overlay').classList.add('hidden');
  ['task-name','task-owner','task-due','task-notes','task-resources'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeAddTask();
}

function closeStepModal(e) {
  if (!e || e.target === document.getElementById('step-modal-overlay')) {
    document.getElementById('step-modal-overlay').classList.add('hidden');
  }
}

// ---- TOAST ----

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.add('hidden'), 2500);
}

// ---- HELPERS ----

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return d; }
}
