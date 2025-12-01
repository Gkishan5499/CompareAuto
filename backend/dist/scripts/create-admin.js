"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
dotenv_1.default.config();
const run = async () => {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    const username = process.env.ADMIN_USER || "admin";
    const password = process.env.ADMIN_PASS || "password";
    const existing = await Admin_model_1.default.findOne({ username });
    if (existing) {
        console.log("Admin already exists");
        process.exit(0);
    }
    const hash = await bcryptjs_1.default.hash(password, 10);
    await Admin_model_1.default.create({ username, passwordHash: hash });
    console.log("Admin created:", username);
    process.exit(0);
};
run().catch(err => { console.error(err); process.exit(1); });
