// Change this to your deployed backend URL when you go live
// e.g. 'https://tech-curious-api.onrender.com/api'
const API_BASE = 'https://tech-curious.onrender.com/api';

const grid = document.getElementById('grid');
const archiveTitle = document.getElementById('archiveTitle');
const filterButtons = document.querySelectorAll('.filter-btn');

const tagLabels = { robotics: 'Robotics', sensors: 'Sensors', iot: 'IoT', motors: 'Motors' };

let allProjects = [];
let activeFilter = 'all';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function cardHTML(p) {
  return `
    <div class="trace-corner relative bg-bgElev border border-line rounded-sm p-5 overflow-hidden hover:border-copper hover:bg-bgElev2 hover:-translate-y-1 transition-all duration-300">
      <div class="flex items-center justify-between mb-4">
        <span class="font-mono text-[10.5px] tracking-wider uppercase text-copper border border-copper/35 rounded-sm px-2 py-0.5">${tagLabels[p.category] || p.category}</span>
        <span class="font-mono text-[11px] text-silkDim">${formatDate(p.date)}</span>
      </div>
      ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.title}" class="w-full h-40 object-cover rounded-sm mb-4 border border-line" loading="lazy">` : ''}
      <h3 class="font-sans font-semibold text-[16.5px] mb-2 leading-snug">${p.title}</h3>
      <p class="text-[13.5px] text-silkDim mb-5 leading-relaxed">${p.spec || ''}</p>
      <span class="font-mono text-xs text-brassBright inline-flex items-center gap-1.5">View source →</span>
    </div>
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
    render();
  } catch (err) {
    archiveTitle.textContent = 'Could not load builds — is the backend running?';
    grid.innerHTML = `<div class="col-span-full text-center py-16 font-mono text-sm text-silkDim">${err.message}</div>`;
  }
}

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('bg-brass', 'text-bg', 'border-brass', 'font-semibold'));
    btn.classList.add('bg-brass', 'text-bg', 'border-brass', 'font-semibold');
    activeFilter = btn.dataset.filter;
    render();
  });
});

loadProjects();
