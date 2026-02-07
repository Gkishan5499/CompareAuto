import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Comparison from "../models/Comparison.model";

const seedComparisonsPath = path.join(__dirname, "..", "data", "comparisons.json");

const loadSeedComparisons = () => {
  try {
    const raw = fs.readFileSync(seedComparisonsPath, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};

export const getAllComparisons = async (req: Request, res: Response) => {
  try {
    const data = await Comparison.find().sort({ views: -1 });

    if (data.length >= 4) {
      return res.json(data);
    }

    const seedData = loadSeedComparisons();
    if (seedData.length === 0) {
      return res.json(data);
    }

    const existingIds = new Set(data.map((item: any) => item.id));
    const merged = [
      ...data,
      ...seedData.filter((item: any) => !existingIds.has(item.id)),
    ].sort((a: any, b: any) => (b.views || 0) - (a.views || 0));

    return res.json(merged);
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
