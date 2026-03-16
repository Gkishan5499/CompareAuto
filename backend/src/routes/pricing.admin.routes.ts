import { Router } from "express";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";
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
router.get("/summary", verifyAdmin, requirePermission("pricing"), getPricingAndTaxSummary);

// Update all variant prices (with optional filters)
// Request body: { type: 'percentage' | 'fixed', value: number, filters?: { modelId?, fuelType?, transmission? } }
router.post("/variants/update-all", verifyAdmin, requirePermission("pricing"), updateAllVariantPrices);

/**
 * State Tax Configuration Endpoints
 */

// Get all state tax configurations
router.get("/taxes/state-wise", verifyAdmin, requirePermission("pricing"), getStateWiseTaxes);

// Update a single state tax configuration
// Request body: { state, gstRate?, rtoPercentage?, insurancePercentage?, registrationFee? }
router.post("/taxes/update", verifyAdmin, requirePermission("pricing"), updateStateWiseTaxes);

// Bulk update state tax configurations
// Request body: { updates: [{ state, gstRate?, rtoPercentage?, insurancePercentage?, registrationFee? }] }
router.post("/taxes/bulk-update", verifyAdmin, requirePermission("pricing"), bulkUpdateStateWiseTaxes);

export default router;
