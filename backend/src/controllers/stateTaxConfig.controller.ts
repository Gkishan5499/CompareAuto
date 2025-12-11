import { Request, Response } from "express";
import StateTaxConfig from "../models/StateTaxConfig.model";

/**
 * Get all state tax configurations
 */
export const getAllStateTaxConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await StateTaxConfig.find().sort({ state: 1 });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch state tax configurations" });
  }
};

/**
 * Get tax config for a specific state
 */
export const getStateTaxConfig = async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const config = await StateTaxConfig.findOne({ state });
    if (!config) {
      return res.status(404).json({ message: `Tax configuration for ${state} not found` });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch state tax configuration" });
  }
};

/**
 * Create a new state tax configuration
 */
export const createStateTaxConfig = async (req: Request, res: Response) => {
  try {
    const { state, gstRate, rtoPercentage, insurancePercentage, registrationFee } = req.body;

    // Validation
    if (!state) {
      return res.status(400).json({ error: "State name is required" });
    }

    // Check if state already exists
    const existingConfig = await StateTaxConfig.findOne({ state });
    if (existingConfig) {
      return res.status(400).json({ error: `Configuration for ${state} already exists` });
    }

    const config = await StateTaxConfig.create({
      state,
      gstRate: gstRate || 5,
      rtoPercentage: rtoPercentage || 9,
      insurancePercentage: insurancePercentage || 3.5,
      registrationFee: registrationFee || 2000,
    });

    res.status(201).json(config);
  } catch (error) {
    res.status(400).json({ error: "Failed to create state tax configuration" });
  }
};

/**
 * Update state tax configuration
 */
export const updateStateTaxConfig = async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const { gstRate, rtoPercentage, insurancePercentage, registrationFee } = req.body;

    const config = await StateTaxConfig.findOneAndUpdate(
      { state },
      {
        ...(gstRate !== undefined && { gstRate }),
        ...(rtoPercentage !== undefined && { rtoPercentage }),
        ...(insurancePercentage !== undefined && { insurancePercentage }),
        ...(registrationFee !== undefined && { registrationFee }),
      },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ message: `Configuration for ${state} not found` });
    }

    res.json(config);
  } catch (error) {
    res.status(400).json({ error: "Failed to update state tax configuration" });
  }
};

/**
 * Bulk update multiple state tax configurations
 */
export const bulkUpdateStateTaxConfigs = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body; // Array of { state, gstRate, rtoPercentage, ... }

    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: "Updates must be an array" });
    }

    const results = await Promise.all(
      updates.map(async (update) => {
        const { state, ...fields } = update;
        return StateTaxConfig.findOneAndUpdate(
          { state },
          fields,
          { new: true, upsert: true }
        );
      })
    );

    res.json({ updated: results.length, configs: results });
  } catch (error) {
    res.status(400).json({ error: "Failed to bulk update state tax configurations" });
  }
};

/**
 * Delete state tax configuration
 */
export const deleteStateTaxConfig = async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const config = await StateTaxConfig.findOneAndDelete({ state });

    if (!config) {
      return res.status(404).json({ message: `Configuration for ${state} not found` });
    }

    res.json({ message: `Configuration for ${state} deleted` });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete state tax configuration" });
  }
};
