const express = require('express');
const fs = require('fs');
const path = require('path');

const { uploadProjectImages } = require('../middleware/upload');
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

// Turns a textarea's newline-separated lines into a clean array.
function toLines(value) {
  if (!value) return [];
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

// GET /api/projects?category=robotics — trimmed fields for the landing grid
router.get('/', (req, res) => {
  const { category } = req.query;
  let projects = readProjects();

  if (category && category !== 'all') {
    projects = projects.filter((p) => p.category === category);
  }

  projects.sort((a, b) => new Date(b.date) - new Date(a.date));

  const summary = projects.map(({ id, title, category, spec, imageUrl, date }) => ({
    id, title, category, spec, imageUrl, date,
  }));

  res.json(summary);
});

// GET /api/projects/:id — full detail for the project page
router.get('/:id', (req, res) => {
  const projects = readProjects();
  const project = projects.find((p) => p.id === Number(req.params.id));

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(project);
});

// POST /api/projects  (admin only)
router.post('/', requireAuth, uploadProjectImages, (req, res) => {
  const { title, category, spec } = req.body;
  const coverImage = req.files?.image?.[0];

  if (!title || !category || !coverImage) {
    return res.status(400).json({ error: 'title, category, and a cover image are required' });
  }

  const wiringImage = req.files?.wiringImage?.[0];

  const projects = readProjects();
  const newProject = {
    id: Date.now(),
    title,
    category,
    spec: spec || '',
    date: new Date().toISOString(),

    imageUrl: coverImage.path,
    imagePublicId: coverImage.filename,
    wiringImageUrl: wiringImage ? wiringImage.path : null,
    wiringImagePublicId: wiringImage ? wiringImage.filename : null,

    overview: req.body.overview || '',
    workingPrinciple: req.body.workingPrinciple || '',
    projectFlow: req.body.projectFlow || '',
    commonIssues: req.body.commonIssues || '',
    conclusion: req.body.conclusion || '',
    sourceCode: req.body.sourceCode || '',

    features: toLines(req.body.features),
    applications: toLines(req.body.applications),
    hardwareRequired: toLines(req.body.hardwareRequired),
    softwareLibraries: toLines(req.body.softwareLibraries),
    stepByStep: toLines(req.body.stepByStep),
    futureImprovements: toLines(req.body.futureImprovements),
    learningOutcomes: toLines(req.body.learningOutcomes),
  };

  projects.unshift(newProject);
  writeProjects(projects);
  res.status(201).json(newProject);
});

// DELETE /api/projects/:id  (admin only) — removes both images from Cloudinary too
router.delete('/:id', requireAuth, async (req, res) => {
  const projects = readProjects();
  const project = projects.find((p) => p.id === Number(req.params.id));

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const idsToDelete = [project.imagePublicId, project.wiringImagePublicId].filter(Boolean);
  await Promise.all(
    idsToDelete.map((publicId) =>
      cloudinary.uploader.destroy(publicId).catch((err) =>
        console.warn('Cloudinary delete failed (continuing anyway):', err.message)
      )
    )
  );

  const updated = projects.filter((p) => p.id !== Number(req.params.id));
  writeProjects(updated);
  res.json({ success: true });
});

module.exports = router;
