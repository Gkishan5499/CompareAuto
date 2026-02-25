"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminUser = exports.updateAdminUser = exports.createAdminUser = exports.getAdminUserById = exports.listAdminUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
const listAdminUsers = async (req, res) => {
    try {
        const items = await Admin_model_1.default.find().select("-passwordHash").sort({ createdAt: -1 });
        return res.json(items);
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to fetch users" });
    }
};
exports.listAdminUsers = listAdminUsers;
const getAdminUserById = async (req, res) => {
    try {
        const user = await Admin_model_1.default.findById(req.params.id).select("-passwordHash");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        return res.json(user);
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to fetch user" });
    }
};
exports.getAdminUserById = getAdminUserById;
const createAdminUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "username and password are required" });
        }
        const existing = await Admin_model_1.default.findOne({ username });
        if (existing)
            return res.status(409).json({ message: "Username already exists" });
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const created = await Admin_model_1.default.create({
            username,
            passwordHash,
            role: role || "editor",
        });
        const safeUser = await Admin_model_1.default.findById(created._id).select("-passwordHash");
        return res.json(safeUser);
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to create user" });
    }
};
exports.createAdminUser = createAdminUser;
const updateAdminUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const updates = {};
        if (username)
            updates.username = username;
        if (role)
            updates.role = role;
        if (password)
            updates.passwordHash = await bcryptjs_1.default.hash(password, 10);
        const updated = await Admin_model_1.default.findByIdAndUpdate(req.params.id, updates, { new: true })
            .select("-passwordHash");
        if (!updated)
            return res.status(404).json({ message: "User not found" });
        return res.json(updated);
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to update user" });
    }
};
exports.updateAdminUser = updateAdminUser;
const deleteAdminUser = async (req, res) => {
    try {
        await Admin_model_1.default.findByIdAndDelete(req.params.id);
        return res.json({ message: "User deleted" });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to delete user" });
    }
};
exports.deleteAdminUser = deleteAdminUser;
