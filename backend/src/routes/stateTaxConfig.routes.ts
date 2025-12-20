import { Router } from "express";
import {
  getAllStateTaxConfigs,
  getStateTaxConfig,
  createStateTaxConfig,
  updateStateTaxConfig,
  bulkUpdateStateTaxConfigs,
  deleteStateTaxConfig,
  applyPredefinedUpdates,
  importStateTaxCsv,
} from "../controllers/stateTaxConfig.controller";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/", limits: { fileSize: 50 * 1024 * 1024 } });

// Get all state tax configurations
router.get("/", getAllStateTaxConfigs);

// Get specific state tax configuration
router.get("/:state", getStateTaxConfig);

// Create new state tax configuration
router.post("/", createStateTaxConfig);

// Apply predefined updates (Petrol fuel type RTO and Insurance)
router.post("/apply-updates", applyPredefinedUpdates);

// CSV import (multipart/form-data with field name `file`)
router.post("/import-csv", upload.single("file"), importStateTaxCsv);

// Bulk update state tax configurations
router.post("/bulk/update", bulkUpdateStateTaxConfigs);

// Update specific state tax configuration
router.put("/:state", updateStateTaxConfig);

// Delete state tax configuration
router.delete("/:state", deleteStateTaxConfig);

export default router;
