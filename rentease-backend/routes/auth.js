import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Resend } from "resend"; // ✅ added
import User from "../models/User.js";

const router = express.Router();
let otpStore = {}; // temporary OTP store

const resend = new Resend(process.env.RESEND_API_KEY); // ✅ added

/**
 * ========================
 * 1. SIGNUP (Legacy)
 * ========================
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Signup successful. Please login now." });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ========================
 * 2. LOGIN
 * ========================
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ========================
 * 3. FORGOT PASSWORD
 * ========================
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📧 Forgot password request for:", email);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    console.log(`🔢 OTP generated: ${otp}`);

    if (process.env.NODE_ENV === "production") {
      console.log("📨 Sending OTP email via Resend...");
      await resend.emails.send({
        from: "MyNest <onboarding@resend.dev>",
        to: email,
        subject: "Password Reset OTP",
        html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
      });
    } else {
      const transporter = createTransporter();
      console.log("📨 Sending OTP email via Nodemailer...");
      await transporter.sendMail({
        from: `"MyNest Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`,
      });
    }

    console.log("✅ OTP email sent successfully!");
    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("❌ Forgot-password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ========================
 * 4. RESET PASSWORD
 * ========================
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!otpStore[email] || otpStore[email] !== parseInt(otp))
      return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    delete otpStore[email];
    res.json({ message: "Password reset successful. You can now login." });
  } catch (err) {
    console.error("❌ Reset-password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ========================
 * 5. SEND SIGNUP OTP
 * ========================
 */
router.post("/send-signup-otp", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📩 Signup OTP request received for:", email);

    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    console.log(`🔢 Generated OTP: ${otp}`);

    if (process.env.NODE_ENV === "production") {
      console.log("📨 Sending signup OTP via Resend...");
      await resend.emails.send({
        from: "MyNest <onboarding@resend.dev>",
        to: email,
        subject: "Email Verification OTP",
        html: `<p>Your MyNest signup OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
      });
    } else {
      const transporter = createTransporter();
      console.log("📨 Sending signup OTP via Nodemailer...");
      await transporter.sendMail({
        from: `"MyNest Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Email Verification OTP",
        text: `Your MyNest signup OTP is ${otp}. It is valid for 5 minutes.`,
      });
    }

    console.log("✅ Signup OTP email sent successfully!");
    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("❌ Error in /send-signup-otp:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ========================
 * 6. VERIFY SIGNUP OTP
 * ========================
 */
router.post("/verify-signup-otp", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    console.log("📬 Verifying OTP for:", email);

    if (!otpStore[email]) return res.status(400).json({ message: "OTP expired or not requested" });
    if (otpStore[email] !== parseInt(otp)) return res.status(400).json({ message: "Invalid OTP" });

    delete otpStore[email];

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    console.log("✅ User registered successfully:", email);
    res.json({ message: "Signup successful! You can now login." });
  } catch (err) {
    console.error("❌ Error in verify-signup-otp:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ========================
 * HELPER: Nodemailer Transporter
 * ========================
 */
function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("⚠️ Missing EMAIL_USER or EMAIL_PASS in environment variables!");
    throw new Error("Email credentials not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((error, success) => {
    if (error) console.error("❌ Nodemailer verify error:", error.message);
    else console.log("✅ Nodemailer ready to send emails");
  });

  return transporter;
}

export default router;
