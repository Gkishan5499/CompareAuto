import { Request, Response } from "express";
import UpcomingCar from "../models/UpcomingCar.model";

export const getAllUpcomingCars = async (req: Request, res: Response) => {
  try {
    const cars = await UpcomingCar.find().sort({ expectedLaunch: 1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch upcoming cars" });
  }
};

export const getUpcomingCarById = async (req: Request, res: Response) => {
  try {
    const car = await UpcomingCar.findOne({ id: req.params.id });
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch upcoming car" });
  }
};

export const createUpcomingCar = async (req: Request, res: Response) => {
  try {
    const car = await UpcomingCar.create(req.body);
    res.json(car);
  } catch (error) {
    res.status(400).json({ error: "Failed to create upcoming car" });
  }
};

export const updateUpcomingCar = async (req: Request, res: Response) => {
  try {
    const car = await UpcomingCar.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(car);
  } catch (error) {
    res.status(400).json({ error: "Failed to update upcoming car" });
  }
};

export const deleteUpcomingCar = async (req: Request, res: Response) => {
  try {
    await UpcomingCar.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Upcoming car deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete upcoming car" });
  }
};
