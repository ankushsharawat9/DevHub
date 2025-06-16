import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (toEmail, verificationToken) => {
  try {
    // Setup transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Gmail address
        pass: process.env.EMAIL_PASS, // Gmail App password
      },
    });

    // Construct verification URL
    const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;

    // Define email content
    const mailOptions = {
      from: `"DevHub" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Verify Your DevHub Email',
      html: `
        <h2>Welcome to DevHub!</h2>
        <p>Thanks for signing up. Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" style="background-color:#6366F1;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
            ✅ Verify My Email
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p><code>${verificationUrl}</code></p>
        <br/>
        <p>This link will expire in <strong>24 hours</strong>.</p>
      `,
      text: `
Welcome to DevHub!

Thanks for signing up. Please verify your email by visiting this link:
${verificationUrl}

If the link doesn't work, copy and paste it into your browser.

This link will expire in 24 hours.
      `.trim(),
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${toEmail}`);
  } catch (err) {
    console.error('❌ Email send error:', err.message);
    throw new Error('Email could not be sent');
  }
};
