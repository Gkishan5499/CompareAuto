import { Router } from "express";
import {
  getAllBrands,
  getBrandById,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  bulkCreateBrands
} from "../controllers/brand.controller";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";

const router = Router();

router.get("/", getAllBrands);
router.get("/slug/:slug", getBrandBySlug);
router.get("/:id", getBrandById);
router.post("/bulk", verifyAdmin, requirePermission("brands"), bulkCreateBrands);
router.post("/", verifyAdmin, requirePermission("brands"), createBrand);
router.put("/:id", verifyAdmin, requirePermission("brands"), updateBrand);
router.delete("/:id", verifyAdmin, requirePermission("brands"), deleteBrand);

export default router;
