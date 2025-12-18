import { Request, Response } from "express";
import SiteSetting from "../models/SiteSetting.model";

export const getAllSettings = async (req: Request, res: Response) => {
  try {
    const settings = await SiteSetting.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

export const getSettingByKey = async (req: Request, res: Response) => {
  try {
    const setting = await SiteSetting.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ message: "Setting not found" });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch setting" });
  }
};

export const upsertSetting = async (req: Request, res: Response) => {
  try {
    const { key, value, type, description } = req.body;
    const setting = await SiteSetting.findOneAndUpdate(
      { key },
      { value, type, description },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(400).json({ error: "Failed to save setting" });
  }
};

export const deleteSetting = async (req: Request, res: Response) => {
  try {
    await SiteSetting.findOneAndDelete({ key: req.params.key });
    res.json({ message: "Setting deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete setting" });
  }
};
