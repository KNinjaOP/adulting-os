const { sendEmail } = require('../config/nodemailer');

const getOTPEmailHTML = (name, otp) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: 'Inter', Arial, sans-serif; background: #0f0f1a; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2d2d4e; }
  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
  .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
  .body { padding: 40px; }
  .body p { color: #a0a0b8; line-height: 1.6; margin: 0 0 20px; }
  .otp-box { background: #0f0f1a; border: 2px solid #667eea; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
  .otp { font-size: 40px; font-weight: 800; color: #667eea; letter-spacing: 12px; }
  .note { font-size: 13px; color: #6b6b8a; }
  .footer { background: #0f0f1a; padding: 24px; text-align: center; color: #6b6b8a; font-size: 12px; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ Adulting OS</h1>
      <p>Your Life Admin Dashboard</p>
    </div>
    <div class="body">
      <p>Hi <strong style="color: #e0e0f0">${name}</strong>,</p>
      <p>Use the OTP below to verify your email address. This code expires in <strong style="color: #667eea">10 minutes</strong>.</p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
      </div>
      <p class="note">If you didn't request this, please ignore this email. Never share this OTP with anyone.</p>
    </div>
    <div class="footer">© 2025 Adulting OS. Built for adulting, so you don't have to stress.</div>
  </div>
</body>
</html>`;

const getResetEmailHTML = (name, resetUrl) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; background: #0f0f1a; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2d2d4e; }
  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
  .body { padding: 40px; }
  .body p { color: #a0a0b8; line-height: 1.6; }
  .btn { display: block; width: fit-content; margin: 24px auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  .footer { background: #0f0f1a; padding: 24px; text-align: center; color: #6b6b8a; font-size: 12px; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>🔐 Reset Password</h1></div>
    <div class="body">
      <p>Hi <strong style="color: #e0e0f0">${name}</strong>,</p>
      <p>Click the button below to reset your password. This link expires in <strong style="color: #667eea">30 minutes</strong>.</p>
      <a href="${resetUrl}" class="btn">Reset My Password</a>
      <p style="font-size:13px; color: #6b6b8a">If you didn't request a password reset, ignore this email. Your password will remain unchanged.</p>
    </div>
    <div class="footer">© 2025 Adulting OS</div>
  </div>
</body>
</html>`;

const getReminderEmailHTML = (name, alerts) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; background: #0f0f1a; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2d2d4e; }
  .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 32px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 24px; }
  .body { padding: 32px; }
  .alert-item { background: #0f0f1a; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 12px 0; }
  .alert-item .type { font-size: 11px; text-transform: uppercase; color: #f59e0b; font-weight: 600; letter-spacing: 1px; }
  .alert-item .title { color: #e0e0f0; font-weight: 600; margin: 6px 0 4px; }
  .alert-item .due { color: #6b6b8a; font-size: 13px; }
  .footer { background: #0f0f1a; padding: 24px; text-align: center; color: #6b6b8a; font-size: 12px; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>⚠️ Daily Reminder Digest</h1></div>
    <div class="body">
      <p style="color:#a0a0b8">Hi <strong style="color:#e0e0f0">${name}</strong>, here are your upcoming reminders:</p>
      ${alerts.map(a => `
        <div class="alert-item">
          <div class="type">${a.type}</div>
          <div class="title">${a.title}</div>
          <div class="due">${a.due}</div>
        </div>
      `).join('')}
    </div>
    <div class="footer">© 2025 Adulting OS — You've got this! 🚀</div>
  </div>
</body>
</html>`;

module.exports = { sendEmail, getOTPEmailHTML, getResetEmailHTML, getReminderEmailHTML };
