import { Request, Response } from "express";
import nodemailer from "nodemailer";
import EnquiryModel from "../models/Enquiry.model";

// In-memory OTP store (per txnId)
const otpStore = new Map<string, { code: string; mobile: string; expiresAt: number }>();

const generateRef = () => {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ENQ-${date}-${random}`;
};

const transporter = (() => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
  });
})();

const sendEmail = async (subject: string, html: string) => {
  const to = process.env.NOTIFY_EMAIL_TO || process.env.SMTP_USER;
  if (!transporter || !to) {
    console.warn("Email transport not configured; skipping email send.");
    return;
  }
  await transporter.sendMail({
    from: process.env.NOTIFY_EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

export const requestOtp = async (req: Request, res: Response) => {
  const { mobile } = req.body as { mobile?: string };
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ success: false, error: "Invalid mobile number" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const txnId = `TXN${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
  const expiresAt = Date.now() + 2 * 60 * 1000;
  otpStore.set(txnId, { code, mobile, expiresAt });

  // In production, send via SMS provider. For now, log for visibility.
  console.log(`[OTP] Mobile: ${mobile}, Code: ${code}, TxnId: ${txnId}`);

  return res.json({ success: true, txnId, ttl: 120 });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { txnId, code } = req.body as { txnId?: string; code?: string };
  const record = txnId ? otpStore.get(txnId) : null;

  if (!record) return res.status(400).json({ success: false, error: "Invalid transaction" });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(txnId!);
    return res.status(400).json({ success: false, error: "OTP expired" });
  }
  if (record.code !== code) return res.status(400).json({ success: false, error: "Invalid OTP" });

  otpStore.delete(txnId!);
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

    const summary = `
      <h2>New Enquiry ${ref}</h2>
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
    `;

    try {
      await sendEmail(`New enquiry ${ref}`, summary);
    } catch (err) {
      console.error("Failed to send enquiry email", err);
    }

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
