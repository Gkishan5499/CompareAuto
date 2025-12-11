import { Router } from "express";
import {
  getAllStateTaxConfigs,
  getStateTaxConfig,
  createStateTaxConfig,
  updateStateTaxConfig,
  bulkUpdateStateTaxConfigs,
  deleteStateTaxConfig,
} from "../controllers/stateTaxConfig.controller";

const router = Router();

// Get all state tax configurations
router.get("/", getAllStateTaxConfigs);

// Get specific state tax configuration
router.get("/:state", getStateTaxConfig);

// Create new state tax configuration
router.post("/", createStateTaxConfig);

// Bulk update state tax configurations
router.post("/bulk/update", bulkUpdateStateTaxConfigs);

// Update specific state tax configuration
router.put("/:state", updateStateTaxConfig);

// Delete state tax configuration
router.delete("/:state", deleteStateTaxConfig);

export default router;
