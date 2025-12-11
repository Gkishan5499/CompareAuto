"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pricing_admin_controller_1 = require("../controllers/pricing.admin.controller");
const router = (0, express_1.Router)();
/**
 * Pricing Management Endpoints
 */
// Get pricing and tax summary
router.get("/summary", pricing_admin_controller_1.getPricingAndTaxSummary);
// Update all variant prices (with optional filters)
// Request body: { type: 'percentage' | 'fixed', value: number, filters?: { modelId?, fuelType?, transmission? } }
router.post("/variants/update-all", pricing_admin_controller_1.updateAllVariantPrices);
/**
 * State Tax Configuration Endpoints
 */
// Get all state tax configurations
router.get("/taxes/state-wise", pricing_admin_controller_1.getStateWiseTaxes);
// Update a single state tax configuration
// Request body: { state, gstRate?, rtoPercentage?, insurancePercentage?, registrationFee? }
router.post("/taxes/update", pricing_admin_controller_1.updateStateWiseTaxes);
// Bulk update state tax configurations
// Request body: { updates: [{ state, gstRate?, rtoPercentage?, insurancePercentage?, registrationFee? }] }
router.post("/taxes/bulk-update", pricing_admin_controller_1.bulkUpdateStateWiseTaxes);
exports.default = router;
