import { Request, Response } from "express";
import Comparison from "../models/Comparison.model";

export const getAllComparisons = async (req: Request, res: Response) => {
  try {
    const data = await Comparison.find().sort({ views: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comparisons" });
  }
};

export const getComparisonById = async (req: Request, res: Response) => {
  try {
    const item = await Comparison.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ message: "Comparison not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comparison" });
  }
};

export const createComparison = async (req: Request, res: Response) => {
  try {
    const item = await Comparison.create(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: "Failed to create comparison" });
  }
};

export const updateComparison = async (req: Request, res: Response) => {
  try {
    const item = await Comparison.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: "Failed to update comparison" });
  }
};

export const deleteComparison = async (req: Request, res: Response) => {
  try {
    await Comparison.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Comparison deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete comparison" });
  }
};
