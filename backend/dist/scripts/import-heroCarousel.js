"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const HeroCarousel_model_1 = __importDefault(require("../models/HeroCarousel.model"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
dotenv_1.default.config();
const importHeroCarousel = async () => {
    try {
        // Read JSON file manually to avoid TypeScript module resolution issues
        const heroData = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/hero-carousel.json"), "utf-8"));
        await mongoose_1.default.connect(process.env.MONGO_URI || "mongodb://localhost:27017/camparecar");
        console.log("Connected to MongoDB");
        // Clear existing data
        await HeroCarousel_model_1.default.deleteMany({});
        console.log("Cleared existing hero carousel data");
        // Insert new data
        await HeroCarousel_model_1.default.insertMany(heroData);
        console.log(`Imported ${heroData.length} hero carousel images`);
        process.exit(0);
    }
    catch (error) {
        console.error("Error importing hero carousel:", error);
        process.exit(1);
    }
};
importHeroCarousel();
