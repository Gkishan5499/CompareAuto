"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stateTaxConfig_controller_1 = require("../controllers/stateTaxConfig.controller");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: "uploads/", limits: { fileSize: 50 * 1024 * 1024 } });
// Get all state tax configurations
router.get("/", stateTaxConfig_controller_1.getAllStateTaxConfigs);
// Get specific state tax configuration
router.get("/:state", stateTaxConfig_controller_1.getStateTaxConfig);
// Create new state tax configuration
router.post("/", stateTaxConfig_controller_1.createStateTaxConfig);
// Apply predefined updates (Petrol fuel type RTO and Insurance)
router.post("/apply-updates", stateTaxConfig_controller_1.applyPredefinedUpdates);
// CSV import (multipart/form-data with field name `file`)
router.post("/import-csv", upload.single("file"), stateTaxConfig_controller_1.importStateTaxCsv);
// Bulk update state tax configurations
router.post("/bulk/update", stateTaxConfig_controller_1.bulkUpdateStateTaxConfigs);
// Update specific state tax configuration
router.put("/:state", stateTaxConfig_controller_1.updateStateTaxConfig);
// Delete state tax configuration
router.delete("/:state", stateTaxConfig_controller_1.deleteStateTaxConfig);
exports.default = router;
