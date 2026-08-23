const express = require('express');
const resend = require('../config/resend');

const router = express.Router();

// POST /api/contact
// Body: { name, email, message }
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are all required' });
  }

  try {
    const { error } = await resend.emails.send({
      // "onboarding@resend.dev" is Resend's shared sender — works with no
      // setup. Once you verify your own domain on resend.com, change this to
      // something like "Tech Curious <hello@techcurious.in>" instead.
      from: 'Tech Curious <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `New message from ${name} — Tech Curious`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) throw new Error(error.message || 'Resend API error');

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact email failed:', err.message);
    res.status(500).json({ error: 'Could not send message right now. Please try again shortly.' });
  }
});

module.exports = router;
