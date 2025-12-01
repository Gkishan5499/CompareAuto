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

const router = Router();

router.get("/", getAllBrands);
router.get("/slug/:slug", getBrandBySlug);
router.get("/:id", getBrandById);
router.post("/bulk", bulkCreateBrands);
router.post("/", createBrand);
router.put("/:id", updateBrand);
router.delete("/:id", deleteBrand);

export default router;
