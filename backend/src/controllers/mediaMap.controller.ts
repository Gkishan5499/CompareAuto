import { Request, Response } from "express";
import MediaMap from "../models/MediaMap.model";

export const getAllMedia = async (req: Request, res: Response) => {
  try {
    const result = await MediaMap.find();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch media map" });
  }
};

export const getMediaByKey = async (req: Request, res: Response) => {
  try {
    const item = await MediaMap.findOne({ key: req.params.key });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch media entry" });
  }
};

export const createMediaEntry = async (req: Request, res: Response) => {
  try {
    const item = await MediaMap.create(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: "Failed to create media entry" });
  }
};

export const updateMediaEntry = async (req: Request, res: Response) => {
  try {
    const item = await MediaMap.findOneAndUpdate(
      { key: req.params.key },
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: "Failed to update media entry" });
  }
};

export const deleteMediaEntry = async (req: Request, res: Response) => {
  try {
    await MediaMap.findOneAndDelete({ key: req.params.key });
    res.json({ message: "Media entry deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete media entry" });
  }
};
