import { Request, Response } from "express";
import Brand from "../models/Brand.model";


export const getAllBrands = async (req: Request, res: Response) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brands" });
  }
};

export const getBrandById = async (req: Request, res: Response) => {
  try {
    const brand = await Brand.findOne({ id: req.params.id });
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brand" });
  }
};

export const getBrandBySlug = async (req: Request, res: Response) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug });
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json(brand);
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
