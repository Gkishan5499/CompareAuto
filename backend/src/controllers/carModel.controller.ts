import { Request, Response } from "express";
import CarModel from "../models/CarModel.model";

export const getAllCarModels = async (req: Request, res: Response) => {
  try {
    const models = await CarModel.find().sort({ name: 1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch car models" });
  }
};

export const getCarModelById = async (req: Request, res: Response) => {
  try {
    const model = await CarModel.findOne({ id: req.params.id });
    if (!model) return res.status(404).json({ message: "Model not found" });
    res.json(model);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch model" });
  }
};

export const createCarModel = async (req: Request, res: Response) => {
  try {
    const model = await CarModel.create(req.body);
    res.json(model);
  } catch (error) {
    res.status(400).json({ error: "Failed to create model" });
  }
};

export const updateCarModel = async (req: Request, res: Response) => {
  try {
    const model = await CarModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(model);
  } catch (error) {
    res.status(400).json({ error: "Failed to update model" });
  }
};

export const deleteCarModel = async (req: Request, res: Response) => {
  try {
    await CarModel.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Model deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete model" });
  }
};

export const getCarModelBySlug = async (req: Request, res: Response) => {
  try {
    const model = await CarModel.findOne({ slug: req.params.slug });
    if (!model) return res.status(404).json({ message: "Model not found" });
    res.json(model);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch model" });
  }
};

export const getCarModelsByBrand = async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const models = await CarModel.find({ brandId }).sort({ name: 1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch models" });
  }
};

export const getCarModelsByBodyType = async (req: Request, res: Response) => {
  try {
    const { bodyType } = req.params;
    const models = await CarModel.find({ bodyType }).sort({ name: 1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch models" });
  }
};

export const getCarModelsByFuelType = async (req: Request, res: Response) => {
  try {
    const { fuelType } = req.params;
    // This would need to check variants for fuel type
    const models = await CarModel.find().sort({ name: 1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch models" });
  }
};

export const getPopularCarModels = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const models = await CarModel.find({ status: { $ne: "upcoming" } })
      .sort({ rating: -1, reviews: -1 })
      .limit(limit);
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch popular models" });
  }
};

export const getNewCarModels = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const models = await CarModel.find({ status: { $ne: "upcoming" } })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch new models" });
  }
};

export const getUpcomingCarModels = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const models = await CarModel.find({ status: "upcoming" })
      .sort({ expectedLaunch: 1 })
      .limit(limit);
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch upcoming models" });
  }
};

export const bulkCreateCarModels = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ error: "Invalid data" });
    const created = await CarModel.insertMany(data);
    res.json(created);
  } catch (err) {
    res.status(400).json({ error: "Failed to bulk create car models" });
  }
};