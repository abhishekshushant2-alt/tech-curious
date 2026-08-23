const nodemailer = require('nodemailer');

// Uses Gmail SMTP with an App Password. Generate one at
// myaccount.google.com/apppasswords (needs 2-Step Verification enabled first).
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

module.exports = transporter;
