const nodemailer = require("nodemailer");

/**
 * Get sanitized SMTP environment configuration for safe diagnostic logging
 */
const getSmtpConfig = () => {
  const host = (process.env.EMAIL_HOST || "").trim();
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || "").trim();
  const from = (process.env.EMAIL_FROM || "").trim() || `"MockMate Security" <noreply@mockmate.com>`;

  return {
    host,
    port,
    user,
    pass,
    from,
    isConfigured: Boolean(host && user && pass),
  };
};

/**
 * Create and configure Nodemailer transporter
 */
const createTransporter = () => {
  const config = getSmtpConfig();

  if (!config.isConfigured) {
    return null;
  }

  const isSecurePort = config.port === 465;

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: isSecurePort,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
};

/**
 * Diagnostic logger - Safe non-sensitive SMTP diagnostic reporter
 */
const logSmtpDiagnostics = async () => {
  const config = getSmtpConfig();

  console.log("--------------------------------------------------");
  console.log("📧 EMAIL SERVICE DIAGNOSTICS:");
  console.log(`- EMAIL_HOST: ${config.host || "[MISSING]"}`);
  console.log(`- EMAIL_PORT: ${config.port}`);
  console.log(`- EMAIL_USER: ${config.user ? config.user : "[MISSING]"}`);
  console.log(`- EMAIL_PASS: ${config.pass ? "PRESENT (length: " + config.pass.length + ")" : "[MISSING]"}`);
  console.log(`- EMAIL_FROM: ${config.from}`);

  if (!config.isConfigured) {
    console.log("⚠️ RESULT: EMAIL NOT CONFIGURED — RESET URL PRINTED FOR DEVELOPMENT ONLY");
    console.log("--------------------------------------------------");
    return false;
  }

  const transporter = createTransporter();
  try {
    await transporter.verify();
    console.log("✅ RESULT: SMTP CONNECTION VERIFIED SUCCESSFULLY");
    console.log("--------------------------------------------------");
    return true;
  } catch (err) {
    console.error(`❌ RESULT: SMTP CONNECTION FAILED: ${err.code || ""} - ${err.message}`);
    console.log("--------------------------------------------------");
    return false;
  }
};

/**
 * Send password reset email with secure token link
 */
const sendPasswordResetEmail = async ({ toEmail, fullName, rawResetToken }) => {
  const config = getSmtpConfig();
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const resetUrl = `${clientUrl}/reset-password?token=${rawResetToken}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your MockMate Password</title>
</head>
<body style="margin:0; padding:0; background-color:#050505; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#F5F5F5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#050505; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="560" border="0" cellspacing="0" cellpadding="0" style="background-color:#181818; border:1px solid #303030; border-radius:16px; padding:40px; text-align:left;">
          <tr>
            <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid #303030;">
              <span style="font-size:24px; font-weight:bold; color:#ffffff; letter-spacing:-0.5px;">👑 MockMate</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 32px; padding-bottom: 24px;">
              <h2 style="margin:0 0 12px 0; font-size:22px; font-weight:bold; color:#ffffff;">Reset Your Password</h2>
              <p style="margin:0 0 16px 0; font-size:14px; line-height:1.6; color:#A1A1AA;">
                Hello ${fullName || "there"},
              </p>
              <p style="margin:0 0 24px 0; font-size:14px; line-height:1.6; color:#A1A1AA;">
                We received a request to reset the password for your MockMate account. Click the button below to choose a new password:
              </p>

              <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 8px 0; font-size:13px; line-height:1.5; color:#71717A;">
                This link is valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.
              </p>
              <p style="margin:12px 0 0 0; font-size:12px; color:#71717A; word-break:break-all;">
                Or copy and paste this URL into your browser:<br>
                <a href="${resetUrl}" style="color:#A855F7; text-decoration:none;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 24px; border-top: 1px solid #303030; font-size:12px; color:#71717A;">
              © 2026 MockMate. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  if (!config.isConfigured) {
    if (process.env.NODE_ENV === "production") {
      console.error("❌ Email service not configured in production environment.");
      return { success: false, mode: "unconfigured_production", error: "Email service not configured" };
    }

    console.log("--------------------------------------------------");
    console.log("⚠️ EMAIL NOT CONFIGURED — RESET URL PRINTED FOR DEVELOPMENT ONLY");
    console.log(`📩 Recipient: ${toEmail}`);
    console.log(`🔗 Link: ${resetUrl}`);
    console.log("--------------------------------------------------");
    return { success: true, mode: "development_fallback" };
  }

  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: toEmail,
      subject: "Reset Your MockMate Password",
      html: htmlContent,
    });

    console.log(`✉️ Password reset email sent successfully (Message ID: ${info.messageId})`);
    return { success: true, mode: "smtp", messageId: info.messageId };
  } catch (error) {
    console.error(`❌ SMTP delivery failed: ${error.code || ""} - ${error.message}`);

    if (process.env.NODE_ENV === "production") {
      return { success: false, mode: "smtp_error", error: error.message };
    }

    console.log("--------------------------------------------------");
    console.log("⚠️ [FALLBACK DEV LOG] Password reset link:");
    console.log(`📩 Recipient: ${toEmail}`);
    console.log(`🔗 Link: ${resetUrl}`);
    console.log("--------------------------------------------------");

    return { success: true, mode: "fallback_after_smtp_error", error: error.message };
  }
};

module.exports = {
  getSmtpConfig,
  logSmtpDiagnostics,
  sendPasswordResetEmail,
};
