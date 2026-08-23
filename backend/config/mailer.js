const nodemailer = require('nodemailer');

// Uses Gmail SMTP with an App Password. Generate one at
// myaccount.google.com/apppasswords (needs 2-Step Verification enabled first).
//
// NOTE: explicit host/port/family (instead of the "service: 'gmail'" shorthand)
// is required on some hosts (Render's free tier included) — without it, the
// connection can hang and fail with "Connection timeout" because the host
// tries to resolve smtp.gmail.com over IPv6 first and gets stuck.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  family: 4, // force IPv4 — fixes ETIMEDOUT on some cloud hosts
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  connectionTimeout: 15000, // fail fast (15s) instead of hanging
});

module.exports = transporter;