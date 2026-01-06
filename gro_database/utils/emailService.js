const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail", // you can also use "hotmail", "yahoo", or custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (to, username) => {
  const mailOptions = {
    from: `"Grocery Store" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🎉 Welcome to Grocery Store!",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <h2>Hello ${username},</h2>
        <p>🎉 Welcome to <strong>Grocery Store</strong>!</p>
        <p>We’re excited to have you with us. Start shopping now and enjoy great deals and discounts on daily essentials.</p>
        <br/>
        <p>Best regards,<br/>The Grocery Store Team</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail };
