import { Request, Response } from "express";
import UpcomingCar from "../models/UpcomingCar.model";
import Brand from "../models/Brand.model";
import { parse } from "csv-parse/sync";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const parsePriceRange = (input: string | undefined) => {
  if (!input) return { min: undefined as number | undefined, max: undefined as number | undefined };
  const cleaned = input.replace(/[,₹\s]/g, "");
  if (cleaned.includes("-")) {
    const [minStr, maxStr] = cleaned.split("-");
    const min = parseInt(minStr, 10);
    const max = parseInt(maxStr, 10);
    return { min: isNaN(min) ? undefined : min, max: isNaN(max) ? undefined : max };
  }
  const val = parseInt(cleaned, 10);
  return { min: isNaN(val) ? undefined : val, max: isNaN(val) ? undefined : val };
};

const parseFuelTypes = (input: string | undefined) => {
  if (!input) return [] as string[];
  return input
    .split(/[\/,|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
};

const parseMonthYear = (input: string | undefined) => {
  if (!input) return { window: undefined as string | undefined, iso: undefined as string | undefined };
  const window = input.trim();
  const date = new Date(Date.parse(window));
  if (!isNaN(date.getTime())) {
    const iso = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
    return { window, iso };
  }
  return { window, iso: undefined };
};

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

export const uploadUpcomingCarsCsv = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "CSV file is required (field: file)" });
    }

    const csvText = req.file.buffer.toString("utf8");
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results: any[] = [];
    for (const row of records as any[]) {
      const brandName: string = (row["Brand"] as string)?.trim();
      const modelName: string = (row["Model"] as string)?.trim();
      const segment: string | undefined = (row["Segment"] as string)?.trim();
      const bodyType: string | undefined = (row["Body Type"] as string)?.trim();
      const powertrain: string | undefined = (row["Powertrain (expected)"] as string)?.trim();
      const launchStr: string | undefined = (row["Expected Launch (Month/Year)"] as string)?.trim();
      const priceStr: string | undefined = ((row["Expected Ex-Showroom Price (₹)"] as string)?.trim() || (row["Expected Ex-Showroom ,Price (₹)"] as string)?.trim());
      const notes: string | undefined = (row["Notes"] as string)?.trim();

      if (!brandName || !modelName) continue;

      const brand = await Brand.findOne({ name: new RegExp(`^${brandName}$`, "i") });
      if (!brand) {
        // If brand isn't found, skip this row but note it in results
        results.push({ modelName, brandName, status: "skipped", reason: "Brand not found" });
        continue;
      }

      const slug = toSlug(modelName);
      const id = slug;
      const { min, max } = parsePriceRange(priceStr);
      const fuels = parseFuelTypes(powertrain);
      const { window, iso } = parseMonthYear(launchStr);

      const keyFeatures: string[] = [];
      if (segment) keyFeatures.push(`Segment: ${segment}`);
      if (notes) keyFeatures.push(`Notes: ${notes}`);

      const payload = {
        id,
        name: modelName,
        brandId: brand.slug,
        brandName: brand.name,
        slug,
        image: "",
        bodyType: bodyType || "",
        fuelTypes: fuels,
        status: "upcoming",
        expectedPriceMin: min,
        expectedPriceMax: max,
        expectedLaunch: iso,
        launchWindow: window,
        variantCount: 0,
        rating: 0,
        reviews: 0,
        keyFeatures,
        media: { hero: "", gallery: [] },
      };

      const existing = await UpcomingCar.findOne({ id });
      if (existing) {
        await UpcomingCar.updateOne({ id }, payload);
        results.push({ id, name: modelName, status: "updated" });
      } else {
        await UpcomingCar.create(payload as any);
        results.push({ id, name: modelName, status: "created" });
      }
    }

    res.json({ total: records.length, processed: results.length, results });
  } catch (error) {
    console.error("CSV upload error:", error);
    res.status(500).json({ error: "Failed to process CSV" });
  }
};
