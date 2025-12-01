import { Request, Response } from "express";
import FuelPrice from "../models/FuelPrice.model";

export const getAllFuelPrices = async (req: Request, res: Response) => {
  try {
    const prices = await FuelPrice.find().sort({ cityName: 1 });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fuel prices" });
  }
};

export const getFuelPriceByCity = async (req: Request, res: Response) => {
  try {
    const price = await FuelPrice.findOne({ city: req.params.city });
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fuel price" });
  }
};

export const createFuelPrice = async (req: Request, res: Response) => {
  try {
    const price = await FuelPrice.create(req.body);
    res.json(price);
  } catch (error) {
    res.status(400).json({ error: "Failed to create fuel price" });
  }
};

export const updateFuelPrice = async (req: Request, res: Response) => {
  try {
    const price = await FuelPrice.findOneAndUpdate(
      { city: req.params.city },
      req.body,
      { new: true }
    );
    res.json(price);
  } catch (error) {
    res.status(400).json({ error: "Failed to update fuel price" });
  }
};

export const deleteFuelPrice = async (req: Request, res: Response) => {
  try {
    await FuelPrice.findOneAndDelete({ city: req.params.city });
    res.json({ message: "Fuel price deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete fuel price" });
  }
};
