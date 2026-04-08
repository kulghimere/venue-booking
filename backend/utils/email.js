const nodemailer = require('nodemailer');

// Build transporter from env — supports Gmail, Outlook, or any SMTP
const createTransporter = () => {
  if (process.env.NODE_ENV === 'test') {
    // Silent no-op in test environment
    return { sendMail: async () => {} };
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,  // 10s — fail fast instead of hanging
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

/**
 * Send an email.
 * @param {{ to: string, subject: string, html: string, text?: string }} options
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'Venue Booking'}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  });
};

// ── Email templates ───────────────────────────────────────────────────────────

exports.sendVerificationEmail = async (user, verificationURL) => {
  await sendEmail({
    to: user.email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#2d3748">Welcome to Venue Booking, ${user.firstName}!</h2>
        <p style="color:#4a5568">Please verify your email address to activate your account.</p>
        <p style="color:#4a5568">This link expires in <strong>24 hours</strong>.</p>
        <a href="${verificationURL}"
           style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;
                  border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">
          Verify Email Address
        </a>
        <p style="color:#718096;font-size:13px">
          Or copy this link into your browser:<br/>
          <a href="${verificationURL}" style="color:#4f46e5">${verificationURL}</a>
        </p>
        <p style="color:#a0aec0;font-size:12px">
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};

exports.sendPasswordResetEmail = async (user, resetURL) => {
  await sendEmail({
    to: user.email,
    subject: 'Password reset request',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#2d3748">Reset your password</h2>
        <p style="color:#4a5568">Hi ${user.firstName},</p>
        <p style="color:#4a5568">
          We received a request to reset the password for your account.
          This link expires in <strong>15 minutes</strong>.
        </p>
        <a href="${resetURL}"
           style="display:inline-block;background:#e53e3e;color:#fff;padding:12px 24px;
                  border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#718096;font-size:13px">
          Or copy this link into your browser:<br/>
          <a href="${resetURL}" style="color:#e53e3e">${resetURL}</a>
        </p>
        <p style="color:#a0aec0;font-size:12px">
          If you did not request a password reset, please ignore this email.
          Your password will not be changed.
        </p>
      </div>
    `,
  });
};

exports.sendPasswordChangedEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Your password was changed',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#2d3748">Password changed</h2>
        <p style="color:#4a5568">Hi ${user.firstName},</p>
        <p style="color:#4a5568">
          Your account password was successfully changed on
          <strong>${new Date().toUTCString()}</strong>.
        </p>
        <p style="color:#4a5568">
          If you did not make this change, please reset your password immediately
          or contact support.
        </p>
      </div>
    `,
  });
};
