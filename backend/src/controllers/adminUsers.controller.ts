import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.model";

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
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "username and password are required" });
    }

    const existing = await Admin.findOne({ username });
    if (existing) return res.status(409).json({ message: "Username already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await Admin.create({
      username,
      passwordHash,
      role: role || "editor",
    });

    const safeUser = await Admin.findById(created._id).select("-passwordHash");
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    const updates: Record<string, any> = {};

    if (username) updates.username = username;
    if (role) updates.role = role;
    if (password) updates.passwordHash = await bcrypt.hash(password, 10);

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
