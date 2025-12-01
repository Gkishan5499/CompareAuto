import { Request, Response } from "express";
import CarSpecs from "../../models/carSpace/CarSpecs.model";

/**
 * NOTE:
 * req: any  → allow req.admin, req.logActivity etc.
 */

/* ============================================
   GET SPECS BY VARIANT ID
============================================ */
export const getSpecsByVariant = async (req: Request, res: Response) => {
  try {
    const { variantId } = req.params;

    const specs = await CarSpecs.findOne({ variantId }).lean();

    if (!specs) {
      return res.status(404).json({ message: "Specifications not found" });
    }

    return res.json({
      success: true,
      data: specs,
    });
  } catch (err) {
    console.error("getSpecsByVariant:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ============================================
   CREATE SPECS (Strict: false → Accept any fields)
============================================ */
export const createSpecs = async (req: any, res: Response) => {
  try {
    const payload = req.body;

    if (!payload.variantId) {
      return res.status(400).json({ message: "variantId is required" });
    }

    const exists = await CarSpecs.findOne({ variantId: payload.variantId });

    if (exists) {
      return res.status(409).json({ message: "Specs already exist for this variant" });
    }

    const created = await CarSpecs.create(payload);

    if (req.logActivity) {
      await req.logActivity("create", "specs", created.variantId, payload);
    }

    return res.json({
      success: true,
      message: "Specs created",
      data: created,
    });
  } catch (err) {
    console.error("createSpecs:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ============================================
   UPDATE SPECS (Upsert Enabled)
============================================ */
export const updateSpecs = async (req: any, res: Response) => {
  try {
    const { variantId } = req.params;
    const payload = req.body;

    const updated = await CarSpecs.findOneAndUpdate(
      { variantId },
      { $set: payload },
      { new: true, upsert: true } // merge + create if not exist
    );

    if (req.logActivity) {
      await req.logActivity("update", "specs", variantId, payload);
    }

    return res.json({
      success: true,
      message: "Specs updated",
      data: updated,
    });
  } catch (err) {
    console.error("updateSpecs:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ============================================
   DELETE SPECS
============================================ */
export const deleteSpecs = async (req: any, res: Response) => {
  try {
    const { variantId } = req.params;

    const removed = await CarSpecs.findOneAndDelete({ variantId });

    if (!removed) {
      return res.status(404).json({ message: "Specs not found" });
    }

    if (req.logActivity) {
      await req.logActivity("delete", "specs", variantId, removed);
    }

    return res.json({
      success: true,
      message: "Specs deleted",
    });
  } catch (err) {
    console.error("deleteSpecs:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ============================================
   LIST SPECS (Pagination + Lean Optimized)
============================================ */
export const listSpecs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(100, parseInt(String(req.query.limit || "50"), 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      CarSpecs.find().sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      CarSpecs.countDocuments(),
    ]);

    return res.json({
      success: true,
      page,
      limit,
      total,
      items,
    });
  } catch (err) {
    console.error("listSpecs:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ============================================
   BULK UPSERT (CSV Import Support)
============================================ */
export const bulkCreateSpecs = async (req: any, res: Response) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: "Invalid format: expected array" });
    }

    const invalid: any[] = [];
    const ops: any[] = [];

    data.forEach((row: any, idx: number) => {
      if (!row.variantId) {
        invalid.push({ rowIndex: idx, row });
        return;
      }

      ops.push({
        updateOne: {
          filter: { variantId: row.variantId },
          update: { $set: row },
          upsert: true,
        },
      });
    });

    const result = await CarSpecs.bulkWrite(ops, { ordered: false });

    const upserted =
      (result as any).upsertedCount ??
      (result as any).nUpserted ??
      0;

    if (req.logActivity) {
      await req.logActivity("bulk-upsert", "specs", "bulk", { count: upserted });
    }

    return res.json({
      success: true,
      upsertedCount: upserted,
      invalidCount: invalid.length,
      invalidRows: invalid,
    });
  } catch (err) {
    console.error("bulkCreateSpecs:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
