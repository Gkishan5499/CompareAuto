"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Missing credentials" });
    const admin = await Admin_model_1.default.findOne({ username });
    if (!admin)
        return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcryptjs_1.default.compare(password, admin.passwordHash);
    if (!ok)
        return res.status(401).json({ message: "Invalid credentials" });
    const token = jsonwebtoken_1.default.sign({ id: admin._id, username: admin.username, role: admin.role }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    res.json({ token, user: { id: admin._id, username: admin.username, role: admin.role } });
});
exports.default = router;
