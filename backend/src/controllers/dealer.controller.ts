import { Request, Response } from "express";
import Dealer from "../models/Dealer.model";

export const getAllDealers = async (req: Request, res: Response) => {
  try {
    const dealers = await Dealer.find().sort({ name: 1 });
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dealers" });
  }
};

export const getDealerById = async (req: Request, res: Response) => {
  try {
    const dealer = await Dealer.findOne({ id: req.params.id });
    if (!dealer) return res.status(404).json({ message: "Dealer not found" });
    res.json(dealer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dealer" });
  }
};

export const createDealer = async (req: Request, res: Response) => {
  try {
    const dealer = await Dealer.create(req.body);
    res.json(dealer);
  } catch (error) {
    res.status(400).json({ error: "Failed to create dealer" });
  }
};

export const updateDealer = async (req: Request, res: Response) => {
  try {
    const dealer = await Dealer.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(dealer);
  } catch (error) {
    res.status(400).json({ error: "Failed to update dealer" });
  }
};

export const deleteDealer = async (req: Request, res: Response) => {
  try {
    await Dealer.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Dealer deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete dealer" });
  }
};
