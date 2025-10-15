// utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or replace with 'smtp.sendgrid.net', etc.
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // your app password
  }
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: `"CampusCore Notifications" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  };
 console.log("In sendEmail func");
  try {
    await transporter.sendMail(mailOptions);
    console.log(`📨 Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error('❌ Email send error:', err);
  }
}

module.exports = { sendEmail };
