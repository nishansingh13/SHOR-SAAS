import nodemailer from 'nodemailer';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465", 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post('/', async (req, res) => {
  const { email, subject, content, attachments } = req.body;
  console.log("email:", email);

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL,
    to: email,
    subject,
    text: content,
    attachments: attachments || [],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).send("Email sent: " + info.response);
  } catch (error) {
    console.error("Mail error:", error);
    res.status(500).send(error.toString());
  }
});

export default router;
