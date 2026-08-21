const express = require('express');
const fs = require('fs');
const path = require('path');

const upload = require('../middleware/upload');
const requireAuth = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

const router = express.Router();
const DB_PATH = path.join(__dirname, '../data/projects.json');

function readProjects() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw || '[]');
}

function writeProjects(list) {
  fs.writeFileSync(DB_PATH, JSON.stringify(list, null, 2));
}

// GET /api/projects?category=robotics
router.get('/', (req, res) => {
  const { category } = req.query;
  let projects = readProjects();

  if (category && category !== 'all') {
    projects = projects.filter((p) => p.category === category);
  }

  projects.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(projects);
});

// POST /api/projects  (admin only, multipart/form-data: title, category, spec, image)
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  const { title, category, spec } = req.body;

  if (!title || !category || !req.file) {
    return res.status(400).json({ error: 'title, category, and image are required' });
  }

  const projects = readProjects();
  const newProject = {
    id: Date.now(),
    title,
    category,
    spec: spec || '',
    imageUrl: req.file.path,          // Cloudinary secure URL
    imagePublicId: req.file.filename, // Cloudinary public_id — needed to delete later
    date: new Date().toISOString(),
  };

  projects.unshift(newProject);
  writeProjects(projects);
  res.status(201).json(newProject);
});

// DELETE /api/projects/:id  (admin only) — also removes the image from Cloudinary
router.delete('/:id', requireAuth, async (req, res) => {
  const projects = readProjects();
  const project = projects.find((p) => p.id === Number(req.params.id));

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (project.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(project.imagePublicId);
    } catch (err) {
      console.warn('Cloudinary delete failed (continuing anyway):', err.message);
    }
  }

  const updated = projects.filter((p) => p.id !== Number(req.params.id));
  writeProjects(updated);
  res.json({ success: true });
});

module.exports = router;
