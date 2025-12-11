import express from "express";
import {
  getAllHeroImages,
  getActiveHeroImages,
  getHeroImageById,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
  reorderHeroImages
} from "../controllers/heroCarousel.controller";

const router = express.Router();

// Public routes
router.get("/active", getActiveHeroImages);

// Admin routes
router.get("/", getAllHeroImages);
router.get("/:id", getHeroImageById);
router.post("/", createHeroImage);
router.put("/:id", updateHeroImage);
router.delete("/:id", deleteHeroImage);
router.post("/reorder", reorderHeroImages);

export default router;
