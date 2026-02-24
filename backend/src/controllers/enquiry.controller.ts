import { Request, Response } from "express";
import nodemailer from "nodemailer";
import EnquiryModel from "../models/Enquiry.model";
import fast2SmsService from "../services/fast2sms.service";

// In-memory OTP store (per txnId)
const otpStore = new Map<string, { code: string; mobile: string; expiresAt: number }>();

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

const generateRef = () => {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ENQ-${date}-${random}`;
};

const transporter = (() => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log("📧 Initializing email transporter...");
  console.log(`📧 SMTP Host: ${host}`);
  console.log(`📧 SMTP Port: ${port}`);
  console.log(`📧 SMTP User: ${user}`);
  console.log(`📧 SMTP Pass: ${pass ? "***configured***" : "NOT SET"}`);
  console.log(`📧 Notify Email: ${process.env.NOTIFY_EMAIL_TO || "NOT SET"}`);

  if (!host || !port || !user || !pass) {
    console.error("❌ SMTP not configured properly - emails will NOT be sent");
    console.error("Missing:", {
      host: !host,
      port: !port,
      user: !user,
      pass: !pass,
    });
    return null;
  }

  console.log("✅ SMTP configuration complete");
  
  return nodemailer.createTransport({
    host,
    port,
    secure: false, // IMPORTANT for Gmail (587)
    auth: {
      user,
      pass, // App Password (no spaces)
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
})();



const sendEmail = async (
  subject: string,
  html: string,
  userEmail?: string
) => {
  const to =
    userEmail || process.env.NOTIFY_EMAIL_TO || process.env.SMTP_USER;

  if (!transporter) {
    console.error("❌ Email transporter not configured. Check SMTP settings in .env");
    return false;
  }

  if (!to) {
    console.error("❌ No recipient email address provided");
    return false;
  }

  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 From: ${process.env.SMTP_FROM || process.env.SMTP_USER}`);
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    
    console.log(`✅ Email sent successfully. Message ID: ${info.messageId}`);
    return true;
  } catch (err: any) {
    console.error("❌ Failed to send email:", err);
    console.error("❌ Error details:", {
      message: err.message,
      code: err.code,
      command: err.command,
    });
    return false;
  }
};

export const requestOtp = async (req: Request, res: Response) => {
  const { mobile, email } = req.body as {
    mobile?: string;
    email?: string;
  };

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid mobile number" });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid email address" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const txnId = `TXN${Date.now()}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
  const expiresAt = Date.now() + 2 * 60 * 1000;

  otpStore.set(txnId, { code, mobile, expiresAt });

  console.log(`📧 OTP Generated - Mobile: ${mobile}, Email: ${email}, Code: ${code}, TxnId: ${txnId}`);

  const otpEmailHtml = `
    <div style="font-family: Arial; padding:20px;">
      <h2>Your OTP Code</h2>
      <p>Your OTP is:</p>
      <h1 style="letter-spacing:5px;">${code}</h1>
      <p>This OTP is valid for 2 minutes.</p>
      <p style="font-size:12px;color:#777;">
        Do not share this code with anyone.
      </p>
    </div>
  `;

  const emailSent = await sendEmail(
    `Your OTP Code`,
    otpEmailHtml,
    email
  );

  console.log(`📧 Email sent status: ${emailSent ? "✅ Success" : "❌ Failed"}`);

  return res.json({
    success: true,
    txnId,
    ttl: 120,
    message: emailSent
      ? "OTP sent to your email"
      : "OTP generated. Please check spam folder.",
  });
};


export const verifyOtp = async (req: Request, res: Response) => {
  const { txnId, code } = req.body as { txnId?: string; code?: string };
  
  // Validation
  if (!txnId || !code) {
    console.error("❌ Missing txnId or code", { txnId, code });
    return res.status(400).json({ success: false, error: "Missing txnId or OTP code" });
  }

  const record = otpStore.get(txnId);

  if (!record) {
    console.error("❌ Invalid transaction ID:", txnId);
    return res.status(400).json({ success: false, error: "Invalid transaction" });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(txnId);
    console.error("❌ OTP expired for txnId:", txnId);
    return res.status(400).json({ success: false, error: "OTP expired" });
  }

  // Convert code to string for comparison
  const codeStr = String(code).trim();
  const storedCodeStr = String(record.code).trim();

  if (codeStr !== storedCodeStr) {
    console.error("❌ Invalid OTP code", { provided: codeStr, stored: storedCodeStr });
    return res.status(400).json({ success: false, error: "Invalid OTP" });
  }

  otpStore.delete(txnId);
  console.log("✅ OTP verified successfully for txnId:", txnId);
  return res.json({ success: true });
};

export const submitEnquiry = async (req: Request, res: Response) => {
  try {
    const { fullName, email, mobile, city, state, pincode, message, pageType, brand, model: carModel, variant, usedId, source } = req.body;

    if (!fullName || !email || !mobile || !city || !state || !pincode) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, error: "Invalid mobile number" });
    }
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, error: "Invalid pincode" });
    }

    const ref = generateRef();
    const doc = await EnquiryModel.create({
      fullName,
      email,
      mobile,
      city,
      state,
      pincode,
      message,
      pageType,
      brand,
      carModel,
      variant,
      usedId,
      source,
      ref,
    });

    const adminEmail = process.env.NOTIFY_EMAIL_TO || process.env.SMTP_USER;
    
    const summary = `
      <div style="font-family: Arial; padding:20px; background:#f9f9f9;">
        <h2 style="color:#333;">New Enquiry ${ref}</h2>
        <div style="background:white; padding:15px; border-radius:5px;">
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mobile:</strong> ${mobile}</p>
          <p><strong>City/State:</strong> ${city}, ${state} - ${pincode}</p>
          <p><strong>Page:</strong> ${pageType || "contact"}</p>
          <p><strong>Brand:</strong> ${brand || "-"}</p>
          <p><strong>Model:</strong> ${carModel || "-"}</p>
          <p><strong>Variant:</strong> ${variant || "-"}</p>
          <p><strong>Used Id:</strong> ${usedId || "-"}</p>
          <p><strong>Source:</strong> ${source || "web"}</p>
          <p><strong>Message:</strong><br/>${message || "(none)"}</p>
          <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    console.log(`📧 Sending admin notification to: ${adminEmail} for enquiry ${ref}`);

    const adminEmailSent = await sendEmail(
      `New Enquiry ${ref} - ${fullName}`,
      summary,
      adminEmail
    );

    console.log(
      `📧 Admin email sent status: ${adminEmailSent ? "✅ Success" : "❌ Failed"}`
    );

    if (!adminEmailSent) {
      console.error("❌ Failed to send admin notification email");
    }

    const userConfirmationHtml = `
      <div style="font-family: Arial; padding:20px;">
        <h2>We have received your enquiry</h2>
        <p>Hi ${fullName},</p>
        <p>Thanks for reaching out. Our team will contact you soon.</p>
        <p><strong>Your reference number:</strong> ${ref}</p>
        <p style="font-size:12px;color:#777;">If you did not submit this request, you can ignore this email.</p>
      </div>
    `;

    const userEmailSent = await sendEmail(
      "We will reach you soon",
      userConfirmationHtml,
      email
    );

    console.log(
      `📧 User confirmation email status: ${userEmailSent ? "✅ Success" : "❌ Failed"}`
    );

    return res.json({ success: true, ref, enquiry: doc });
  } catch (err) {
    console.error("submitEnquiry error", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const listEnquiries = async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const items = await EnquiryModel.find().sort({ createdAt: -1 }).limit(limit);
  return res.json({ success: true, items });
};
