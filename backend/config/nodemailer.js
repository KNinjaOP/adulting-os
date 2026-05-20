const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Adulting OS" <noreply@adulting-os.com>',
    to,
    subject,
    text,
    html,
  });
  return info;
};

module.exports = { sendEmail };
