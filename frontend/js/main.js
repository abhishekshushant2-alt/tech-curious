// Change this to your deployed backend URL when you go live
const API_BASE = 'http://api.techcurious.in/api';

const grid = document.getElementById('grid');
const archiveTitle = document.getElementById('archiveTitle');
const latestDrop = document.getElementById('latestDrop');
const filterButtons = document.querySelectorAll('.filter-btn');

const tagLabels = { robotics: 'Robotics', sensors: 'Sensors', iot: 'IoT', motors: 'Motors' };

let allProjects = [];
let activeFilter = 'all';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function cardHTML(p) {
  return `
    <a href="project.html?id=${p.id}" class="trace-corner relative block bg-bgElev border border-line rounded-sm p-5 overflow-hidden hover:border-copper hover:bg-bgElev2 hover:-translate-y-1 transition-all duration-300">
      <div class="flex items-center justify-between mb-4">
        <span class="font-mono text-[10.5px] tracking-wider uppercase text-copper border border-copper/35 rounded-sm px-2 py-0.5">${tagLabels[p.category] || p.category}</span>
        <span class="font-mono text-[11px] text-silkDim">${formatDate(p.date)}</span>
      </div>
      ${p.imageUrl ? `
        <div class="card-img-wrap rounded-sm mb-4 border border-line">
          <img src="${p.imageUrl}" alt="${p.title}" class="w-full h-40 object-cover" loading="lazy">
        </div>` : ''}
      <h3 class="font-sans font-semibold text-[16.5px] mb-2 leading-snug">${p.title}</h3>
      <p class="text-[13.5px] text-silkDim mb-5 leading-relaxed">${p.spec || ''}</p>
      <span class="font-mono text-xs text-brassBright inline-flex items-center gap-1.5">View source →</span>
    </a>
  `;
}

function renderLatestDrop() {
  if (!allProjects.length) {
    latestDrop.classList.add('hidden');
    return;
  }
  const latest = allProjects[0];
  latestDrop.classList.remove('hidden');
  latestDrop.innerHTML = `
    <a href="project.html?id=${latest.id}" class="trace-corner relative block bg-bgElev border border-copper/40 rounded-sm p-6 md:p-8 grid md:grid-cols-[1fr_1.2fr] gap-6 items-center hover:border-brass transition-all duration-300">
      ${latest.imageUrl ? `
        <div class="card-img-wrap rounded-sm border border-line order-2 md:order-1">
          <img src="${latest.imageUrl}" alt="${latest.title}" class="w-full h-56 object-cover">
        </div>` : '<div class="order-2 md:order-1"></div>'}
      <div class="order-1 md:order-2">
        <div class="font-mono text-[11.5px] tracking-[0.14em] text-brassBright uppercase mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-brassBright pulse-dot"></span> Latest drop · ${formatDate(latest.date)}
        </div>
        <h2 class="font-mono font-bold text-2xl md:text-3xl mb-3 leading-tight">${latest.title}</h2>
        <p class="text-silkDim text-sm mb-5">${latest.spec || ''}</p>
        <span class="font-mono text-sm text-brassBright inline-flex items-center gap-2">View blueprint →</span>
      </div>
    </a>
  `;
}

function render() {
  const list = activeFilter === 'all'
    ? allProjects
    : allProjects.filter((p) => p.category === activeFilter);

  grid.innerHTML = list.length
    ? list.map(cardHTML).join('')
    : `<div class="col-span-full text-center py-16 font-mono text-sm text-silkDim">No builds logged in this category yet.</div>`;

  archiveTitle.innerHTML = `<b class="text-brassBright">${list.length}</b> builds shown · <b class="text-brassBright">${allProjects.length}</b> total logged`;
}

async function loadProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to load projects');
    allProjects = await res.json();
    renderLatestDrop();
    render();
  } catch (err) {
    archiveTitle.textContent = 'Could not load builds — is the backend running?';
    grid.innerHTML = `<div class="col-span-full text-center py-16 font-mono text-sm text-silkDim">${err.message}</div>`;
  }
}

filterButtons.forEach((btn, i) => {
  if (i === 0) btn.classList.add('bg-brass', 'text-bg', 'border-brass', 'font-semibold');
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('bg-brass', 'text-bg', 'border-brass', 'font-semibold'));
    btn.classList.add('bg-brass', 'text-bg', 'border-brass', 'font-semibold');
    activeFilter = btn.dataset.filter;
    render();
  });
});

loadProjects();

// ---------- Contact modal ----------
const contactModal = document.getElementById('contactModal');
const openContactLinks = [document.getElementById('openContact'), document.getElementById('openContact2')].filter(Boolean);
const closeContact = document.getElementById('closeContact');
const contactForm = document.getElementById('contactForm');
const contactMsg = document.getElementById('contactMsg');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');

openContactLinks.forEach((el) => el.addEventListener('click', (e) => {
  e.preventDefault();
  contactModal.classList.add('open');
}));

closeContact?.addEventListener('click', () => contactModal.classList.remove('open'));
contactModal?.addEventListener('click', (e) => {
  if (e.target === contactModal) contactModal.classList.remove('open');
});

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  contactSubmitBtn.disabled = true;
  contactSubmitBtn.textContent = 'Sending…';
  contactMsg.classList.add('hidden');

  try {
    const formData = new FormData(contactForm);
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');

    contactMsg.textContent = "Message sent — I'll get back to you soon.";
    contactMsg.classList.remove('hidden', 'text-copper');
    contactMsg.classList.add('text-brassBright');
    contactForm.reset();
  } catch (err) {
    contactMsg.textContent = err.message;
    contactMsg.classList.remove('hidden', 'text-brassBright');
    contactMsg.classList.add('text-copper');
  } finally {
    contactSubmitBtn.disabled = false;
    contactSubmitBtn.textContent = 'Send message →';
  }
});
