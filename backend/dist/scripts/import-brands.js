"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Brand_model_1 = __importDefault(require("../models/Brand.model"));
dotenv_1.default.config();
const filePath = path_1.default.join(__dirname, "..", "data", "brands.json");
const importBrands = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
        const raw = fs_1.default.readFileSync(filePath, "utf-8");
        const brands = JSON.parse(raw);
        await Brand_model_1.default.deleteMany(); // clear old data
        await Brand_model_1.default.insertMany(brands);
        console.log(`Inserted ${brands.length} brands`);
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
importBrands();
