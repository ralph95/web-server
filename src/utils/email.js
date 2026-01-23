// src/utils/email.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.NEXT_PRIVATE_SMTP_HOST,
  port: process.env.NEXT_PRIVATE_SMTP_PORT,
  auth: {
    user: process.env.NEXT_PRIVATE_SMTP_USERNAME,
    pass: process.env.NEXT_PRIVATE_SMTP_PASSWORD,
  },
});

/**
 * Generic email sender
 */
export async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.NEXT_PRIVATE_SMTP_USERNAME, // change this to your app email
      to,
      subject,
      html,
    });
    console.log("📨 Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    return false;
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(to, token) {
  const verifyUrl = `${
    process.env.APP_BASE_URL
  }/verify?token=${token}&email=${encodeURIComponent(to)}`;

  const html = `
  <h2>Verify your account</h2>
  <p>Click the button below to verify your email address:</p>
  
  <!-- ✅ Email-safe button -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
    <tr>
      <td align="center" bgcolor="#1a73e8" style="border-radius: 5px;">
        <a href="${verifyUrl}" target="_blank" 
          style="display: inline-block; padding: 12px 24px; font-size: 16px; 
                 font-weight: bold; color: #ffffff; text-decoration: none; 
                 border-radius: 5px; background-color: #1a73e8;">
          Verify My Account
        </a>
      </td>
    </tr>
  </table>

  <p>If the button doesn’t work, copy and paste this link into your browser:</p>
  <p><a href="${verifyUrl}" target="_blank">${verifyUrl}</a></p>
`;

  return sendEmail(to, "Verify your account", html);
}

/**
 * Send password reset email
 */
export async function sendResetPasswordEmail(to, token) {
  const resetUrl = `${
    process.env.APP_BASE_URL
  }/reset-password?token=${token}&email=${encodeURIComponent(to)}`;
  const html = `
    <h2>Reset your password</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 1 hour.</p>
  `;
  return sendEmail(to, "Reset your password", html);
}
