import { Request, Response } from "express";
import UsedCar from "../models/UsedCar.model";

export const getAllUsedCars = async (req: Request, res: Response) => {
  try {
    const cars = await UsedCar.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch used cars" });
  }
};

export const getUsedCarById = async (req: Request, res: Response) => {
  try {
    const car = await UsedCar.findOne({ id: req.params.id });
    if (!car) return res.status(404).json({ message: "Used car not found" });
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch car" });
  }
};

export const getUsedCarsByCity = async (req: Request, res: Response) => {
  try {
    const cars = await UsedCar.find({ city: req.params.city });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cars by city" });
  }
};

export const createUsedCar = async (req: Request, res: Response) => {
  try {
    const car = await UsedCar.create(req.body);
    res.json(car);
  } catch (error) {
    res.status(400).json({ error: "Failed to create used car" });
  }
};

export const updateUsedCar = async (req: Request, res: Response) => {
  try {
    const car = await UsedCar.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(car);
  } catch (error) {
    res.status(400).json({ error: "Failed to update used car" });
  }
};

export const deleteUsedCar = async (req: Request, res: Response) => {
  try {
    await UsedCar.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Used car deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete used car" });
  }
};
