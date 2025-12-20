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

/**
 * Apply predefined updates to state tax configurations (Petrol fuel type)
 */
export const applyPredefinedUpdates = async (req: Request, res: Response) => {
  try {
    const updatedStateTaxConfigs = [
      // States
      { state: "Andhra Pradesh", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
      { state: "Arunachal Pradesh", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
      { state: "Assam", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
      { state: "Bihar", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
      { state: "Chhattisgarh", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
      { state: "Goa", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Gujarat", rtoPercentage: 6, insurancePercentage: 5.4, rtoByFuelType: { petrol: 6 }, insuranceByFuelType: { petrol: 5.4 } },
      { state: "Haryana", rtoPercentage: 7, insurancePercentage: 5.6, rtoByFuelType: { petrol: 7 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Himachal Pradesh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Jharkhand", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Karnataka", rtoPercentage: 13, insurancePercentage: 5.8, rtoByFuelType: { petrol: 13 }, insuranceByFuelType: { petrol: 5.8 } },
      { state: "Kerala", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Madhya Pradesh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Maharashtra", rtoPercentage: 11, insurancePercentage: 5.8, rtoByFuelType: { petrol: 11 }, insuranceByFuelType: { petrol: 5.8 } },
      { state: "Manipur", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Meghalaya", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Mizoram", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Nagaland", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Odisha", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Punjab", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Rajasthan", rtoPercentage: 6, insurancePercentage: 5.4, rtoByFuelType: { petrol: 6 }, insuranceByFuelType: { petrol: 5.4 } },
      { state: "Sikkim", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Tamil Nadu", rtoPercentage: 9, insurancePercentage: 5.6, rtoByFuelType: { petrol: 9 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Telangana", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Tripura", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Uttar Pradesh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Uttarakhand", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "West Bengal", rtoPercentage: 5, insurancePercentage: 5.4, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
      
      // Union Territories
      { state: "Andaman and Nicobar Islands", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Chandigarh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Dadra & Nagar Haveli and Daman & Diu", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Delhi", rtoPercentage: 5, insurancePercentage: 5.4, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
      { state: "Delhi NCR", rtoPercentage: 5, insurancePercentage: 5.4, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
      { state: "Jammu & Kashmir", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Ladakh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Lakshadweep", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
      { state: "Puducherry", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
    ];

    let updatedCount = 0;
    let notFoundStates: string[] = [];

    for (const config of updatedStateTaxConfigs) {
      const result = await StateTaxConfig.findOneAndUpdate(
        { state: config.state },
        {
          $set: {
            rtoPercentage: config.rtoPercentage,
            insurancePercentage: config.insurancePercentage,
            rtoByFuelType: config.rtoByFuelType,
            insuranceByFuelType: config.insuranceByFuelType,
          },
        },
        { new: true }
      );

      if (result) {
        updatedCount++;
      } else {
        notFoundStates.push(config.state);
      }
    }

    res.json({ 
      success: true,
      message: `Updated ${updatedCount} state tax configurations`,
      updatedCount,
      notFoundStates,
      totalAttempted: updatedStateTaxConfigs.length
    });
  } catch (error) {
    console.error("Error applying predefined updates:", error);
    res.status(500).json({ error: "Failed to apply predefined updates" });
  }
};

/**
 * Import State/UT tax configs from CSV (multipart/form-data)
 * Accepts headers (case-insensitive):
 *  - state, code(optional), type(optional), fuel, rto%, insurance%
 *  Alternate header names allowed:
 *  - rto_percent | base_registration_tax | base registration tax (%)
 *  - insurance_percent | insurance % (incl gst)
 */
export const importStateTaxCsv = async (req: any, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "CSV file is required (field name 'file')" });

    const fs = await import("fs");
    const { parse } = await import("csv-parse");

    const filePath: string = req.file.path;

    const report = {
      totalRows: 0,
      updated: 0,
      created: 0,
      skipped: 0,
      errors: [] as any[],
    };

    const normalizeKey = (s: string) => String(s || "").trim().toLowerCase();
    const toNumber = (v: any) => {
      if (v === undefined || v === null) return undefined as number | undefined;
      const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
      return Number.isFinite(n) ? n : undefined;
    };

    const parser = (fs as any).createReadStream(filePath).pipe(
      (parse as any)({ columns: true, skip_empty_lines: true, trim: true, relax_column_count: true })
    );

    for await (const row of parser as any) {
      report.totalRows++;

      try {
        // Normalize headers to lowercase for flexible CSVs
        const norm: Record<string, any> = {};
        for (const k of Object.keys(row)) norm[normalizeKey(k)] = row[k];

        const state = norm["state"] || norm["state name"] || norm["region"];
        const fuelRaw = norm["fuel"] || norm["fueltype"] || norm["fuel_type"]; // petrol/diesel/cng/hybrid/ev
        if (!state) {
          report.skipped++;
          report.errors.push({ row: report.totalRows, reason: "Missing state" });
          continue;
        }

        const fuel = String(fuelRaw || "").toLowerCase();

        // RTO percentage detection
        const rtoPct =
          toNumber(norm["rto%"]) ??
          toNumber(norm["rto percent"]) ??
          toNumber(norm["rto_percentage"]) ??
          toNumber(norm["rto percentage"]) ??
          toNumber(norm["base registration tax (%)"]) ??
          toNumber(norm["base_registration_tax"]) ??
          toNumber(norm["registration_tax"]) ??
          undefined;

        // Insurance percentage detection
        const insPct =
          toNumber(norm["insurance %"]) ??
          toNumber(norm["insurance % (incl gst)"]) ??
          toNumber(norm["insurance_percent"]) ??
          toNumber(norm["insurance percentage"]) ??
          undefined;

        // Fetch existing or prepare upsert
        const existing = await StateTaxConfig.findOne({ state });
        let payload: any = {};

        if (fuel) {
          // Update fuel-specific fields
          if (rtoPct !== undefined) {
            payload["rtoByFuelType." + fuel] = rtoPct;
            // keep legacy rtoPercentage in sync when petrol provided
            if (fuel === "petrol") payload["rtoPercentage"] = rtoPct;
          }
          if (insPct !== undefined) {
            payload["insuranceByFuelType." + fuel] = insPct;
            if (fuel === "petrol") payload["insurancePercentage"] = insPct;
          }
        } else {
          // Generic fallback when no fuel column provided
          if (rtoPct !== undefined) payload["rtoPercentage"] = rtoPct;
          if (insPct !== undefined) payload["insurancePercentage"] = insPct;
        }

        if (!existing) {
          // create with minimal defaults
          const base: any = {
            state,
            gstRate: 5,
            rtoPercentage: payload.rtoPercentage ?? 9,
            insurancePercentage: payload.insurancePercentage ?? 3.5,
            registrationFee: 2000,
          };
          if (fuel) {
            base.rtoByFuelType = { [fuel]: rtoPct };
            base.insuranceByFuelType = { [fuel]: insPct };
          }
          await StateTaxConfig.create(base);
          report.created++;
        } else {
          if (Object.keys(payload).length === 0) {
            report.skipped++;
            continue;
          }
          await StateTaxConfig.updateOne({ _id: (existing as any)._id }, { $set: payload });
          report.updated++;
        }
      } catch (e: any) {
        report.errors.push({ row: report.totalRows, reason: e?.message || String(e) });
        report.skipped++;
      }
    }

    try { (fs as any).unlinkSync(filePath); } catch {}

    return res.json({ success: true, ...report });
  } catch (error) {
    console.error("CSV import failed:", error);
    return res.status(500).json({ error: "Failed to import state tax configuration CSV" });
  }
};
