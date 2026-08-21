const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// POST /api/auth/login
// Body: { adminId, passcode }
router.post('/login', (req, res) => {
  const { adminId, passcode } = req.body;

  if (!adminId || !passcode) {
    return res.status(400).json({ error: 'Admin ID and passcode are required' });
  }

  if (adminId === process.env.ADMIN_ID && passcode === process.env.ADMIN_PASSCODE) {
    const token = jwt.sign({ adminId }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, expiresIn: '8h' });
  }

  return res.status(401).json({ error: 'Invalid admin ID or passcode' });
});

module.exports = router;
