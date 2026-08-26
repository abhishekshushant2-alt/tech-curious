// Change this to your deployed backend URL when you go live
const API_BASE = 'https://api.techcurious.in/api';
const TOKEN_KEY = 'techCuriousToken';

// ---------- login.html ----------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  const errorMsg = document.getElementById('errorMsg');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');

    const adminId = document.getElementById('adminId').value;
    const passcode = document.getElementById('passcode').value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, passcode }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem(TOKEN_KEY, data.token);
      window.location.href = 'admin.html';
    } catch (err) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
  });
}

// ---------- admin.html ----------
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    window.location.href = 'login.html';
  }

  const adminGrid = document.getElementById('adminGrid');
  const uploadMsg = document.getElementById('uploadMsg');
  const uploadBtn = document.getElementById('uploadBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const tagLabels = { robotics: 'Robotics', sensors: 'Sensors', iot: 'IoT', motors: 'Motors' };

  function showMsg(text, isError) {
    uploadMsg.textContent = text;
    uploadMsg.classList.remove('hidden', 'text-copper', 'text-brassBright');
    uploadMsg.classList.add(isError ? 'text-copper' : 'text-brassBright');
  }

  async function loadAdminProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    const projects = await res.json();

    adminGrid.innerHTML = projects.map((p) => `
      <div class="bg-bgElev border border-line rounded-2xl p-4">
        <img src="${p.imageUrl}" alt="${p.title}" class="w-full h-32 object-cover rounded-xl mb-3 border border-line">
        <div class="flex items-center justify-between mb-2">
          <span class="font-mono text-[10px] uppercase text-copper">${tagLabels[p.category] || p.category}</span>
          <button data-id="${p.id}" class="deleteBtn font-mono text-[11px] text-silkDim hover:text-copper transition">Delete</button>
        </div>
        <h3 class="font-sans font-semibold text-sm">${p.title}</h3>
      </div>
    `).join('') || `<p class="col-span-full font-mono text-sm text-silkDim">No builds uploaded yet.</p>`;

    document.querySelectorAll('.deleteBtn').forEach((btn) => {
      btn.addEventListener('click', () => deleteProject(btn.dataset.id));
    });
  }

  async function deleteProject(id) {
    if (!confirm('Delete this build? This also removes the image from Cloudinary.')) return;

    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      loadAdminProjects();
    } else {
      alert('Failed to delete — your session may have expired. Try logging in again.');
    }
  }

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading…';

    try {
      const formData = new FormData(uploadForm);
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // don't set Content-Type — browser sets multipart boundary
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      showMsg('Build uploaded successfully.', false);
      uploadForm.reset();
      loadAdminProjects();
    } catch (err) {
      showMsg(err.message, true);
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload build →';
    }
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = 'login.html';
  });

  loadAdminProjects();
}
