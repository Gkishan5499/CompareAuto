import { Request, Response } from "express";
import Brand from "../models/Brand.model";
import CarModel from "../models/CarModel.model";


export const getAllBrands = async (req: Request, res: Response) => {
  try {
    const brands = await Brand.find().sort({ name: 1 }).lean();
    
    // Get model counts for each brand
    const brandIds = brands.map(b => b.id);
    const modelCounts = await CarModel.aggregate([
      { $match: { brandId: { $in: brandIds } } },
      { $group: { _id: "$brandId", count: { $sum: 1 } } }
    ]);
    
    // Create a map for quick lookup
    const countMap = new Map(modelCounts.map(mc => [mc._id, mc.count]));
    
    // Add model count to each brand
    const brandsWithCounts = brands.map(brand => ({
      ...brand,
      modelCount: countMap.get(brand.id) || 0
    }));
    
    res.json(brandsWithCounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brands" });
  }
};

export const getBrandById = async (req: Request, res: Response) => {
  try {
    const brand = await Brand.findOne({ id: req.params.id }).lean();
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    
    // Get model count for this brand
    const modelCount = await CarModel.countDocuments({ brandId: brand.id });
    
    res.json({ ...brand, modelCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brand" });
  }
};

export const getBrandBySlug = async (req: Request, res: Response) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug }).lean();
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    
    // Get model count for this brand
    const modelCount = await CarModel.countDocuments({ brandId: brand.id });
    
    res.json({ ...brand, modelCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brand" });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const brand = await Brand.create(req.body);
    res.json(brand);
  } catch (error) {
    res.status(400).json({ error: "Failed to create brand" });
  }
};

export const bulkCreateBrands = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ error: "Invalid data" });
    const created = await Brand.insertMany(data);
    res.json(created);
  } catch (error) {
    res.status(400).json({ error: "Failed to bulk create brands" });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const brand = await Brand.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(brand);
  } catch (error) {
    res.status(400).json({ error: "Failed to update brand" });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    await Brand.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Brand deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete brand" });
  }
};
