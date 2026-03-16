import { Router } from "express";
import Admin from "../models/Admin.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ALL_ADMIN_PERMISSIONS, DEFAULT_EDITOR_PERMISSIONS } from "../constants/adminPermissions";
dotenv.config();

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Missing credentials" });

  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const effectivePermissions = admin.role === "admin"
    ? ALL_ADMIN_PERMISSIONS
    : (Array.isArray(admin.permissions) && admin.permissions.length > 0
      ? admin.permissions
      : DEFAULT_EDITOR_PERMISSIONS);

  const token = jwt.sign(
    { id: admin._id, username: admin.username, role: admin.role, permissions: effectivePermissions },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" },
  );

  res.json({
    token,
    user: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: effectivePermissions,
    },
  });
});

export default router;
