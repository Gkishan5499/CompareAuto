import { Router } from "express";
import {
  getAllVariants,
  getVariantById,
  getVariantsByModel,
  createVariant,
  updateVariant,
  deleteVariant,
  bulkCreateVariants,
  updateVariantPrice,
  bulkUpdateVariantPrices,
  updateModelVariantsPrices,
} from "../controllers/variant.controller";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";

const router = Router();

router.get("/", getAllVariants);
router.get("/:id", getVariantById);
router.get("/model/:modelId", getVariantsByModel);
router.post("/bulk", verifyAdmin, requirePermission("variants"), bulkCreateVariants);
router.post("/", verifyAdmin, requirePermission("variants"), createVariant);
router.put("/:id", verifyAdmin, requirePermission("variants"), updateVariant);
router.delete("/:id", verifyAdmin, requirePermission("variants"), deleteVariant);

// Price management endpoints
router.put("/:id/price", verifyAdmin, requirePermission("pricing"), updateVariantPrice);
router.post("/prices/bulk", verifyAdmin, requirePermission("pricing"), bulkUpdateVariantPrices);
router.post("/model/:modelId/update-prices", verifyAdmin, requirePermission("pricing"), updateModelVariantsPrices);

export default router;

