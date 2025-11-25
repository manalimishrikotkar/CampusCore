// utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or replace with 'smtp.sendgrid.net', etc.
  auth: {
    user: 'ashleshapathak.4@gmail.com' , // your email
    pass: 'tkjw azmc lmwi rcpp'  // your app password
  }
});

async function sendEmail(to, subject, text) {
  console.log("email pass:", process.env.EMAIL_PASS);
 console.log("email",process.env.EMAIL_USER);
  const mailOptions = {
    from: `"CampusCore Notifications" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  };
 console.log("In sendEmail func");
 console.log("mailop:",mailOptions);

 console.log("sub",{subject});
  try {
    await transporter.sendMail(mailOptions);
    console.log(`📨 Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error('❌ Email send error:', err);
  }
}

module.exports = { sendEmail };
