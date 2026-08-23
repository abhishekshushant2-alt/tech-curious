// Change this to your deployed backend URL when you go live
const API_BASE = 'http://api.techcurious.in/api';

const content = document.getElementById('content');
const tagLabels = { robotics: 'Robotics', sensors: 'Sensors', iot: 'IoT', motors: 'Motors' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Renders a "one item per line" array as a checkmark bullet list. Returns '' if empty.
function bulletSection(title, items) {
  if (!items || !items.length) return '';
  return `
    <div class="section-card">
      <div class="section-head"><span class="bar"></span> ${title}</div>
      <ul class="bullet-list">
        ${items.map((i) => `<li>${escapeHTML(i)}</li>`).join('')}
      </ul>
    </div>
  `;
}

// Renders a free-text paragraph block. Returns '' if empty.
function textSection(title, text) {
  if (!text) return '';
  return `
    <div class="section-card">
      <div class="section-head"><span class="bar"></span> ${title}</div>
      <p class="text-[13.5px] text-[#C9CFC9] leading-relaxed whitespace-pre-line">${escapeHTML(text)}</p>
    </div>
  `;
}

async function loadProject() {
  const id = new URLSearchParams(window.location.search).get('id');

  if (!id) {
    content.innerHTML = `<div class="font-mono text-sm text-silkDim">No project specified.</div>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Project not found');
    const p = await res.json();
    render(p);
  } catch (err) {
    content.innerHTML = `<div class="font-mono text-sm text-silkDim">${err.message} — it may have been removed.</div>`;
  }
}

function render(p) {
  document.title = `${p.title} — Tech Curious`;

  content.innerHTML = `
    <div class="font-mono text-[12px] tracking-[0.14em] text-copper uppercase mb-4 flex items-center gap-2">
      <span class="chip">${tagLabels[p.category] || p.category}</span>
      <span class="text-silkDim normal-case tracking-normal">${formatDate(p.date)}</span>
    </div>

    <h1 class="font-mono font-bold text-[clamp(26px,3.4vw,38px)] leading-tight mb-4">${escapeHTML(p.title)}</h1>
    ${p.spec ? `<p class="text-silkDim text-[15px] mb-8 max-w-[60ch]">${escapeHTML(p.spec)}</p>` : '<div class="mb-8"></div>'}

    ${p.imageUrl ? `
      <img src="${p.imageUrl}" alt="${escapeHTML(p.title)}" class="w-full max-h-[420px] object-cover rounded-sm border border-line mb-10">
    ` : ''}

    <div class="grid gap-6">
      ${textSection('Overview', p.overview)}

      ${p.wiringImageUrl ? `
        <div class="section-card">
          <div class="section-head"><span class="bar"></span> Wiring Schematic</div>
          <img src="${p.wiringImageUrl}" alt="Wiring schematic for ${escapeHTML(p.title)}" class="w-full rounded-sm border border-line">
        </div>
      ` : ''}

      ${textSection('Working Principle', p.workingPrinciple)}
      ${bulletSection('Features', p.features)}
      ${textSection('Project Flow', p.projectFlow)}
      ${bulletSection('Applications', p.applications)}
      ${bulletSection('Hardware Required', p.hardwareRequired)}
      ${bulletSection('Software &amp; Libraries', p.softwareLibraries)}
      ${bulletSection('Step-by-Step Build Instructions', p.stepByStep)}
      ${bulletSection('Future Improvements', p.futureImprovements)}
      ${textSection('Common Issues &amp; Solutions', p.commonIssues)}
      ${bulletSection('Learning Outcomes', p.learningOutcomes)}
      ${textSection('Conclusion', p.conclusion)}

      ${p.sourceCode ? `
        <div class="section-card">
          <div class="flex items-center justify-between mb-4">
            <div class="section-head mb-0"><span class="bar"></span> Source Code</div>
            <button id="copyBtn" class="font-mono text-[11px] px-3 py-1.5 border border-line rounded-sm text-silkDim hover:border-copper hover:text-silk transition">Copy source code</button>
          </div>
          <pre class="code-block"><code id="sourceCode">${escapeHTML(p.sourceCode)}</code></pre>
        </div>
      ` : ''}
    </div>
  `;

  const copyBtn = document.getElementById('copyBtn');
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(p.sourceCode);
      copyBtn.textContent = 'Copied ✓';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy source code';
        copyBtn.classList.remove('copied');
      }, 1800);
    } catch {
      copyBtn.textContent = 'Select the code above to copy manually';
    }
  });
}

loadProject();
