import { Router } from "express";
import {
  getAllVariants,
  getVariantById,
  getVariantsByModel,
  createVariant,
  updateVariant,
  deleteVariant
  , bulkCreateVariants
} from "../controllers/variant.controller";

const router = Router();

router.get("/", getAllVariants);
router.get("/:id", getVariantById);
router.get("/model/:modelId", getVariantsByModel);
router.post("/bulk", bulkCreateVariants);
router.post("/", createVariant);
router.put("/:id", updateVariant);
router.delete("/:id", deleteVariant);

export default router;

