import { Router } from "express";
import {
  updateAllVariantPrices,
  getStateWiseTaxes,
  updateStateWiseTaxes,
  bulkUpdateStateWiseTaxes,
  getPricingAndTaxSummary,
} from "../controllers/pricing.admin.controller";

const router = Router();

/**
 * Pricing Management Endpoints
 */

// Get pricing and tax summary
router.get("/summary", getPricingAndTaxSummary);

// Update all variant prices (with optional filters)
// Request body: { type: 'percentage' | 'fixed', value: number, filters?: { modelId?, fuelType?, transmission? } }
router.post("/variants/update-all", updateAllVariantPrices);

/**
 * State Tax Configuration Endpoints
 */

// Get all state tax configurations
router.get("/taxes/state-wise", getStateWiseTaxes);

// Update a single state tax configuration
// Request body: { state, gstRate?, rtoPercentage?, insurancePercentage?, registrationFee? }
router.post("/taxes/update", updateStateWiseTaxes);

// Bulk update state tax configurations
// Request body: { updates: [{ state, gstRate?, rtoPercentage?, insurancePercentage?, registrationFee? }] }
router.post("/taxes/bulk-update", bulkUpdateStateWiseTaxes);

export default router;
