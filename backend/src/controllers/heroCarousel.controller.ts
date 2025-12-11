import { Request, Response } from "express";
import HeroCarousel from "../models/HeroCarousel.model";

/**
 * Generate a unique ID for hero carousel
 */
const generateHeroId = () => {
  return `hero-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get all hero carousel images (ordered by 'order' field)
 */
export const getAllHeroImages = async (req: Request, res: Response) => {
  try {
    const images = await HeroCarousel.find().sort({ order: 1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hero images" });
  }
};

/**
 * Get only active hero carousel images
 */
export const getActiveHeroImages = async (req: Request, res: Response) => {
  try {
    const images = await HeroCarousel.find({ isActive: true }).sort({ order: 1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active hero images" });
  }
};

/**
 * Get single hero image by ID
 */
export const getHeroImageById = async (req: Request, res: Response) => {
  try {
    const image = await HeroCarousel.findOne({ id: req.params.id });
    if (!image) return res.status(404).json({ message: "Hero image not found" });
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hero image" });
  }
};

/**
 * Create new hero carousel image
 */
export const createHeroImage = async (req: Request, res: Response) => {
  try {
    const heroData = {
      ...req.body,
      id: req.body.id || generateHeroId()
    };

    const heroImage = await HeroCarousel.create(heroData);
    res.json(heroImage);
  } catch (error) {
    console.error("Create hero image error:", error);
    res.status(400).json({ error: "Failed to create hero image", details: (error as any).message });
  }
};

/**
 * Update hero carousel image
 */
export const updateHeroImage = async (req: Request, res: Response) => {
  try {
    const heroImage = await HeroCarousel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    if (!heroImage) return res.status(404).json({ message: "Hero image not found" });
    res.json(heroImage);
  } catch (error) {
    console.error("Update hero image error:", error);
    res.status(400).json({ error: "Failed to update hero image", details: (error as any).message });
  }
};

/**
 * Delete hero carousel image
 */
export const deleteHeroImage = async (req: Request, res: Response) => {
  try {
    const result = await HeroCarousel.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ message: "Hero image not found" });
    res.json({ message: "Hero image deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete hero image" });
  }
};

/**
 * Reorder hero carousel images
 */
export const reorderHeroImages = async (req: Request, res: Response) => {
  try {
    const { imageIds } = req.body; // Array of IDs in desired order

    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ error: "imageIds must be an array" });
    }

    // Update order for each image
    const updatePromises = imageIds.map((id, index) =>
      HeroCarousel.findOneAndUpdate({ id }, { order: index }, { new: true })
    );

    await Promise.all(updatePromises);
    const updatedImages = await HeroCarousel.find().sort({ order: 1 });
    
    res.json(updatedImages);
  } catch (error) {
    console.error("Reorder hero images error:", error);
    res.status(400).json({ error: "Failed to reorder hero images" });
  }
};
