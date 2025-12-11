import { Request, Response } from "express";
import Variant from "../models/Variant.model";
import StateTaxConfig from "../models/StateTaxConfig.model";
import { getStateFromCity, calculatePriceBreakdownWithConfig, ALL_STATES } from "../lib/priceUtils";

const parseEngineCc = (engine?: string): number | undefined => {
  if (!engine) return undefined;
  const match = engine.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!match) return undefined;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value)) return undefined;
  return value < 50 ? Math.round(value * 1000) : Math.round(value);
};

export const getVariantPriceBreakdown = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { city, state } = req.query as any;

    // Try to find variant by ID first (MongoDB ObjectId), then by slug, then by id field
    let variant = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a valid MongoDB ObjectId
      variant = await Variant.findById(id).lean();
    }
    
    if (!variant) {
      // Try finding by slug field
      variant = await Variant.findOne({ slug: id }).lean();
    }
    
    if (!variant) {
      // Try finding by id field (some variants might use this)
      variant = await Variant.findOne({ id: id }).lean();
    }
    
    if (!variant) {
      console.error(`Variant not found with id/slug: ${id}`);
      return res.status(404).json({ error: "Variant not found", searchedId: id });
    }

    const exShowroomPrice = variant.exShowroomPrice || variant.price || 0;
    
    if (!exShowroomPrice || exShowroomPrice <= 0) {
      console.error(`Variant ${id} has invalid price: ${exShowroomPrice}`);
      return res.status(400).json({ error: "Variant has invalid ex-showroom price" });
    }
    const resolvedState = state || getStateFromCity(city);

    // Validate state exists in database
    if (!ALL_STATES.includes(resolvedState)) {
      return res.status(400).json({ error: `State "${resolvedState}" not recognized` });
    }

    const config = await StateTaxConfig.findOne({ state: resolvedState }).lean();
    if (!config) {
      return res.status(404).json({ error: `Tax config not found for state "${resolvedState}"` });
    }

    const breakdown = calculatePriceBreakdownWithConfig(exShowroomPrice, config as any, {
      fuelType: variant.fuelType,
      engineCc: parseEngineCc(variant.engine),
      stateCode: resolvedState,
    });
    
    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    return res.json({ variantId: id, breakdown, taxConfig: config, city, state: resolvedState });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to compute price breakdown" });
  }
};

export const calcPriceFromValue = async (req: Request, res: Response) => {
  try {
    const { exShowroomPrice, city, state, fuelType, engineCc } = req.body as any;
    const resolvedState = state || getStateFromCity(city);

    // Validate state
    if (!ALL_STATES.includes(resolvedState)) {
      return res.status(400).json({ error: `State "${resolvedState}" not recognized` });
    }

    const config = await StateTaxConfig.findOne({ state: resolvedState }).lean();
    if (!config) {
      return res.status(404).json({ error: `Tax config not found for state "${resolvedState}"` });
    }

    const breakdown = calculatePriceBreakdownWithConfig(Number(exShowroomPrice) || 0, config as any, {
      fuelType,
      engineCc: typeof engineCc === "string" ? Number(engineCc) : engineCc,
      stateCode: resolvedState,
    });
    return res.json({ breakdown, taxConfig: config, city, state: resolvedState });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to calculate price" });
  }
};
