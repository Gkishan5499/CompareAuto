import { Request, Response } from "express";
import CarModel from "../models/CarModel.model";
import Brand from "../models/Brand.model";

// Get most searched cars (by body type)
export const getMostSearchedCars = async (req: Request, res: Response) => {
  try {
    const { bodyType } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;
    
    let query: any = { status: { $ne: "upcoming" } };
    if (bodyType) {
      query.bodyType = bodyType;
    }
    
    const models = await CarModel.find(query)
      .sort({ rating: -1, reviews: -1 })
      .limit(limit)
      .populate("brandId", "name slug logo");
    
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch most searched cars" });
  }
};

// Get popular brands
export const getPopularBrands = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 15;
    const brands = await Brand.find()
      .sort({ modelCount: -1, name: 1 })
      .limit(limit);
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch popular brands" });
  }
};

// Get trending comparisons
export const getTrendingComparisons = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    // This would typically come from a comparisons collection with view counts
    // For now, returning a structure
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trending comparisons" });
  }
};

// Get latest launches
export const getLatestLaunches = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    const models = await CarModel.find({ status: "new" })
      .sort({ launchDate: -1 })
      .limit(limit)
      .populate("brandId", "name slug logo");
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch latest launches" });
  }
};

// Get electric cars
export const getElectricCars = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    // This would need to check variants for electric fuel type
    const models = await CarModel.find()
      .sort({ name: 1 })
      .limit(limit)
      .populate("brandId", "name slug logo");
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch electric cars" });
  }
};

