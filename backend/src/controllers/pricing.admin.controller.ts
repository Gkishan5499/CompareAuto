import { Request, Response } from "express";
import Variant from "../models/Variant.model";
import StateTaxConfig from "../models/StateTaxConfig.model";

/**
 * Admin endpoint to update all variant ex-showroom prices
 * Supports percentage or fixed amount increase/decrease
 */
export const updateAllVariantPrices = async (req: Request, res: Response) => {
  try {
    const { type, value, filters } = req.body;

    if (!type || !["percentage", "fixed"].includes(type)) {
      return res.status(400).json({ error: "Type must be 'percentage' or 'fixed'" });
    }

    if (value === undefined || typeof value !== "number") {
      return res.status(400).json({ error: "Value must be a number" });
    }

    // Optional filters: by brand, model, fuelType, transmission
    const query: any = {};
    if (filters) {
      if (filters.modelId) query.modelId = filters.modelId;
      if (filters.fuelType) query.fuelType = filters.fuelType;
      if (filters.transmission) query.transmission = filters.transmission;
    }

    const variants = await Variant.find(query);

    if (variants.length === 0) {
      return res.status(404).json({ message: "No variants found matching the filters" });
    }

    const results = await Promise.all(
      variants.map(async (variant) => {
        const currentPrice = variant.exShowroomPrice || variant.price;
        let newPrice: number;

        if (type === "percentage") {
          newPrice = Math.round(currentPrice * (1 + value / 100));
        } else {
          newPrice = currentPrice + value;
        }

        return Variant.findOneAndUpdate(
          { id: variant.id },
          { exShowroomPrice: newPrice, price: newPrice },
          { new: true }
        );
      })
    );

    res.json({
      message: `Successfully updated ${results.length} variant prices`,
      updateType: type,
      updateValue: value,
      variantsUpdated: results.length,
      variants: results,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update variant prices" });
  }
};

/**
 * Admin endpoint to get all state tax configurations
 */
export const getStateWiseTaxes = async (req: Request, res: Response) => {
  try {
    const configs = await StateTaxConfig.find().sort({ state: 1 });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch state tax configurations" });
  }
};

/**
 * Admin endpoint to update state-wise taxes
 */
export const updateStateWiseTaxes = async (req: Request, res: Response) => {
  try {
    const { state, gstRate, rtoPercentage, insurancePercentage, registrationFee, tcsRate, fastagCharges } = req.body;

    if (!state) {
      return res.status(400).json({ error: "State is required" });
    }

    const config = await StateTaxConfig.findOneAndUpdate(
      { state },
      {
        ...(gstRate !== undefined && { gstRate }),
        ...(rtoPercentage !== undefined && { rtoPercentage }),
        ...(insurancePercentage !== undefined && { insurancePercentage }),
        ...(registrationFee !== undefined && { registrationFee }),
        ...(tcsRate !== undefined && { tcsRate }),
        ...(fastagCharges !== undefined && { fastagCharges }),
      },
      { new: true, upsert: true }
    );

    res.json({
      message: `State tax configuration for ${state} updated successfully`,
      config,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update state tax configuration" });
  }
};

/**
 * Admin endpoint to bulk update state-wise taxes
 */
export const bulkUpdateStateWiseTaxes = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body; // Array of { state, gstRate, rtoPercentage, ... }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: "Updates must be a non-empty array" });
    }

    const results = await Promise.all(
      updates.map(async (update) => {
        const { state, gstRate, rtoPercentage, insurancePercentage, registrationFee } = update;

        if (!state) {
          return { error: "State is required", data: update } as any;
        }

        return StateTaxConfig.findOneAndUpdate(
          { state },
          {
            ...(gstRate !== undefined && { gstRate }),
            ...(rtoPercentage !== undefined && { rtoPercentage }),
            ...(insurancePercentage !== undefined && { insurancePercentage }),
            ...(registrationFee !== undefined && { registrationFee }),
          },
          { new: true, upsert: true }
        );
      })
    );

    const successful = results.filter((r: any) => !r.error);
    const failed = results.filter((r: any) => r.error);

    res.json({
      message: `Successfully updated ${successful.length} state tax configurations`,
      totalUpdated: successful.length,
      totalFailed: failed.length,
      configs: successful,
      ...(failed.length > 0 && { errors: failed }),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to bulk update state tax configurations" });
  }
};

/**
 * Admin endpoint to get pricing and tax summary
 */
export const getPricingAndTaxSummary = async (req: Request, res: Response) => {
  try {
    const totalVariants = await Variant.countDocuments();
    const avgPrice = await Variant.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: { $ifNull: ["$exShowroomPrice", "$price"] } },
          min: { $min: { $ifNull: ["$exShowroomPrice", "$price"] } },
          max: { $max: { $ifNull: ["$exShowroomPrice", "$price"] } },
        },
      },
    ]);

    // keep `_id` so frontend can use it as a stable key and for dialog control
    const taxConfigs = await StateTaxConfig.find().select("-__v").lean();

    res.json({
      variants: {
        total: totalVariants,
        priceStats: avgPrice[0] || { average: 0, min: 0, max: 0 },
      },
      taxConfigs,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pricing and tax summary" });
  }
};
