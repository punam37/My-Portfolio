// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/api", (req, res) => {
  res.send("Backend is running on Vercel!");
});

// ⚠️ DO NOT exit process on Vercel
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("ERROR: EMAIL_USER or EMAIL_PASS not set");
}

// Nodemailer setup
const contactEmail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// Verify transporter (safe for Vercel)
contactEmail.verify((error) => {
  if (error) {
    console.error("Nodemailer error:", error);
  } else {
    console.log("Ready to Send Emails");
  }
});

// POST /api/contact
app.post("/api/contact", async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({
      code: 400,
      status: "Missing required fields",
    });
  }

  const fullName = `${firstName} ${lastName}`;

  const mail = {
    from: `"${fullName}" <${email}>`,
    to: process.env.EMAIL_USER,
    subject: "Contact Form Submission - Portfolio",
    html: `
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "N/A"}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await contactEmail.sendMail(mail);
    return res.status(200).json({ code: 200, status: "Message Sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      code: 500,
      status: "Error sending message",
    });
  }
});

/**
 * ✅ IMPORTANT
 * - No app.listen()
 * - Export app for Vercel
 */
module.exports = app;
