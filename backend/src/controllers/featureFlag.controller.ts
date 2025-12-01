import { Request, Response } from "express";
import FeatureFlag from "../models/FeatureFlag.model";

export const getFeatureFlags = async (req: Request, res: Response) => {
  try {
    const flags = await FeatureFlag.findOne();
    res.json(flags);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feature flags" });
  }
};

export const updateFeatureFlags = async (req: Request, res: Response) => {
  try {
    const flags = await FeatureFlag.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true
    });
    res.json(flags);
  } catch (error) {
    res.status(400).json({ error: "Failed to update feature flags" });
  }
};
