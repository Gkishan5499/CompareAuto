import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import Admin from "../models/Admin.model";
import {
  ALL_ADMIN_PERMISSIONS,
  DEFAULT_EDITOR_PERMISSIONS,
  sanitizeAdminPermissions,
} from "../constants/adminPermissions";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = new Set(["admin", "editor"]);

const mailTransporter = (() => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
})();

const sendAdminAccessConfirmationEmail = async (opts: {
  email: string;
  username: string;
  role: string;
  permissions: string[];
}) => {
  if (!mailTransporter) return false;

  try {
    await mailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: opts.email,
      subject: "Your CompareCar Admin Access Is Created",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 16px; color: #111827;">
          <h2 style="margin: 0 0 12px;">Admin Access Created</h2>
          <p style="margin: 0 0 8px;">Your account has been created successfully.</p>
          <p style="margin: 0 0 6px;"><strong>Username:</strong> ${opts.username}</p>
          <p style="margin: 0 0 6px;"><strong>Email:</strong> ${opts.email}</p>
          <p style="margin: 0 0 12px;"><strong>Role:</strong> ${opts.role}</p>
          <p style="margin: 0 0 12px;"><strong>Access:</strong> ${opts.permissions.join(", ") || "None"}</p>
          <p style="margin: 0;">Please contact your super admin if you need login help.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send admin access confirmation email:", error);
    return false;
  }
};

export const listAdminUsers = async (req: Request, res: Response) => {
  try {
    const items = await Admin.find().select("-passwordHash").sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getAdminUserById = async (req: Request, res: Response) => {
  try {
    const user = await Admin.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role, email, permissions } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedRole = String(role || "").trim().toLowerCase();
    const selectedPermissions = sanitizeAdminPermissions(permissions);

    if (!username || !password || !normalizedEmail || !normalizedRole) {
      return res.status(400).json({ message: "username, email, role and password are required" });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!ALLOWED_ROLES.has(normalizedRole)) {
      return res.status(400).json({ message: "Role must be admin or editor" });
    }

    const effectivePermissions = normalizedRole === "admin"
      ? ALL_ADMIN_PERMISSIONS
      : (selectedPermissions.length > 0 ? selectedPermissions : DEFAULT_EDITOR_PERMISSIONS);

    if (normalizedRole !== "admin" && effectivePermissions.length === 0) {
      return res.status(400).json({ message: "Select at least one access permission" });
    }

    const existing = await Admin.findOne({
      $or: [{ username }, { email: normalizedEmail }],
    });
    if (existing) {
      if (existing.username === username) {
        return res.status(409).json({ message: "Username already exists" });
      }
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await Admin.create({
      username,
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      permissions: effectivePermissions,
    });

    const safeUser = await Admin.findById(created._id).select("-passwordHash");
    const emailNotificationSent = await sendAdminAccessConfirmationEmail({
      email: normalizedEmail,
      username,
      role: normalizedRole,
      permissions: effectivePermissions,
    });

    if (!safeUser) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    return res.json({
      ...safeUser.toObject(),
      emailNotificationSent,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role, email, permissions } = req.body;
    const updates: Record<string, any> = {};

    if (username) updates.username = username;
    if (role) {
      const normalizedRole = String(role).trim().toLowerCase();
      if (!ALLOWED_ROLES.has(normalizedRole)) {
        return res.status(400).json({ message: "Role must be admin or editor" });
      }
      updates.role = normalizedRole;
    }
    if (password) updates.passwordHash = await bcrypt.hash(password, 10);
    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!EMAIL_REGEX.test(normalizedEmail)) {
        return res.status(400).json({ message: "Valid email is required" });
      }

      const duplicate = await Admin.findOne({ email: normalizedEmail, _id: { $ne: req.params.id } });
      if (duplicate) {
        return res.status(409).json({ message: "Email already exists" });
      }

      updates.email = normalizedEmail;
    }

    if (permissions !== undefined) {
      updates.permissions = sanitizeAdminPermissions(permissions);
      if (updates.permissions.length === 0 && updates.role !== "admin") {
        return res.status(400).json({ message: "Select at least one access permission" });
      }
    }

    if (updates.role === "admin") {
      updates.permissions = ALL_ADMIN_PERMISSIONS;
    }

    const updated = await Admin.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select("-passwordHash");

    if (!updated) return res.status(404).json({ message: "User not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteAdminUser = async (req: Request, res: Response) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    return res.json({ message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete user" });
  }
};
