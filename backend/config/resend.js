const { Resend } = require('resend');

// Resend sends over HTTPS (port 443) instead of raw SMTP — this matters
// because Render's free tier blocks outbound SMTP ports (465/587) entirely,
// which is why the old nodemailer/Gmail setup always failed with a timeout.
//
// Sign up free at resend.com, then get your API key from the dashboard.
// No domain verification is required to start — Resend's shared
// "onboarding@resend.dev" sender works immediately for testing/small use.
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = resend;
