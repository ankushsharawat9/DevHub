const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,     // your Gmail address
      pass: process.env.EMAIL_PASS,     // your Gmail App Password (not account password)
    },
  });

  const mailOptions = {
    from: `"DevHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📤 Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email send error:', err);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;
