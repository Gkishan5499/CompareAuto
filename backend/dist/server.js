"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const seedStateTaxConfigs_1 = require("./scripts/seedStateTaxConfigs");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    await (0, db_1.connectDB)();
    // Seed state tax configurations if not already seeded
    await (0, seedStateTaxConfigs_1.seedStateTaxConfigs)();
    app_1.default.listen(PORT, () => {
        console.log(`🚀 Server started on port ${PORT}`);
    });
};
startServer();
