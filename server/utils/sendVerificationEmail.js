import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (toEmail, verificationToken, type = 'register') => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Gmail address
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    // Define path and messaging based on type
    const isEmailChange = type === 'emailChange';
    const path = isEmailChange ? '/confirm-new-email' : '/verify-email';
    const url = `${process.env.FRONTEND_URL}${path}?token=${verificationToken}&email=${toEmail}`;

    const subject = isEmailChange
      ? 'Confirm Your New Email Address'
      : 'Verify Your DevHub Email';

    const buttonText = isEmailChange
      ? '✅ Confirm New Email'
      : '✅ Verify My Email';

    const introText = isEmailChange
      ? 'Please confirm your new email address by clicking the button below:'
      : 'Thanks for signing up. Please verify your email by clicking below:';

    const html = `
      <div style="font-family:sans-serif; max-width:600px; margin:auto; padding:20px;">
        <h2>${subject}</h2>
        <p>${introText}</p>
        <p style="text-align:center; margin:30px 0;">
          <a href="${url}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;background-color:#6366F1;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">
            ${buttonText}
          </a>
        </p>
        <p>If the button doesn't work, paste this URL in your browser:</p>
        <code style="word-break:break-all; background:#f4f4f4; padding:10px; display:block; border-radius:4px;">${url}</code>
        <p style="margin-top:20px;">This link will expire in <strong>24 hours</strong>.</p>
        <hr/>
        <p style="font-size:0.9em;color:#777;">If you did not request this, you can safely ignore it.</p>
      </div>
    `;

    const text = `
${subject}

${introText}

${url}

If the button above doesn't work, copy and paste the URL into your browser.
This link expires in 24 hours.
    `.trim();

    await transporter.sendMail({
      from: `"DevHub" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html,
      text,
    });

    console.log(`📨 Email sent to ${toEmail} for ${type === 'emailChange' ? 'email change' : 'registration'} verification.`);
  } catch (err) {
    console.error('❌ Failed to send verification email:', err.message);
    throw new Error('Failed to send verification email');
  }
};
