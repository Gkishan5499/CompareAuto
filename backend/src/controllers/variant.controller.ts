import { Request, Response } from "express";
import Variant from "../models/Variant.model";

export const getAllVariants = async (req: Request, res: Response) => {
  try {
    const variants = await Variant.find().sort({ price: 1 });
    res.json(variants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch variants" });
  }
};

export const getVariantById = async (req: Request, res: Response) => {
  try {
    const variant = await Variant.findOne({ id: req.params.id });
    if (!variant) return res.status(404).json({ message: "Variant not found" });
    res.json(variant);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch variant" });
  }
};

export const getVariantsByModel = async (req: Request, res: Response) => {
  try {
    const variants = await Variant.find({ modelId: req.params.modelId });
    res.json(variants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch model variants" });
  }
};

export const createVariant = async (req: Request, res: Response) => {
  try {
    const variant = await Variant.create(req.body);
    res.json(variant);
  } catch (error) {
    res.status(400).json({ error: "Failed to create variant" });
  }
};

export const bulkCreateVariants = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ error: "Invalid data" });
    const created = await Variant.insertMany(data);
    res.json(created);
  } catch (err) {
    res.status(400).json({ error: "Failed to bulk create variants" });
  }
};

export const updateVariant = async (req: Request, res: Response) => {
  try {
    const variant = await Variant.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(variant);
  } catch (error) {
    res.status(400).json({ error: "Failed to update variant" });
  }
};

export const deleteVariant = async (req: Request, res: Response) => {
  try {
    await Variant.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Variant deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete variant" });
  }
};
