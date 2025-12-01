import { Request, Response } from "express";
import ElectricityRate from "../models/ElectricityRate.model";

export const getAllElectricityRates = async (req: Request, res: Response) => {
  try {
    const rates = await ElectricityRate.find().sort({ stateName: 1 });
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch electricity rates" });
  }
};

export const getElectricityRatesByState = async (req: Request, res: Response) => {
  try {
    const rates = await ElectricityRate.find({ state: req.params.state });
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch state rates" });
  }
};

export const createElectricityRate = async (req: Request, res: Response) => {
  try {
    const rate = await ElectricityRate.create(req.body);
    res.json(rate);
  } catch (error) {
    res.status(400).json({ error: "Failed to create electricity rate" });
  }
};

export const updateElectricityRate = async (req: Request, res: Response) => {
  try {
    const rate = await ElectricityRate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(rate);
  } catch (error) {
    res.status(400).json({ error: "Failed to update electricity rate" });
  }
};

export const deleteElectricityRate = async (req: Request, res: Response) => {
  try {
    await ElectricityRate.findByIdAndDelete(req.params.id);
    res.json({ message: "Electricity rate deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete electricity rate" });
  }
};
