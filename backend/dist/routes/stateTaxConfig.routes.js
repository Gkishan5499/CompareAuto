"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stateTaxConfig_controller_1 = require("../controllers/stateTaxConfig.controller");
const router = (0, express_1.Router)();
// Get all state tax configurations
router.get("/", stateTaxConfig_controller_1.getAllStateTaxConfigs);
// Get specific state tax configuration
router.get("/:state", stateTaxConfig_controller_1.getStateTaxConfig);
// Create new state tax configuration
router.post("/", stateTaxConfig_controller_1.createStateTaxConfig);
// Bulk update state tax configurations
router.post("/bulk/update", stateTaxConfig_controller_1.bulkUpdateStateTaxConfigs);
// Update specific state tax configuration
router.put("/:state", stateTaxConfig_controller_1.updateStateTaxConfig);
// Delete state tax configuration
router.delete("/:state", stateTaxConfig_controller_1.deleteStateTaxConfig);
exports.default = router;
