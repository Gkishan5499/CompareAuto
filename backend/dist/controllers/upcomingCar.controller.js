"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadUpcomingCarsCsv = exports.deleteUpcomingCar = exports.updateUpcomingCar = exports.createUpcomingCar = exports.getUpcomingCarById = exports.getAllUpcomingCars = void 0;
const UpcomingCar_model_1 = __importDefault(require("../models/UpcomingCar.model"));
const Brand_model_1 = __importDefault(require("../models/Brand.model"));
const sync_1 = require("csv-parse/sync");
const toSlug = (value) => value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
const parsePriceRange = (input) => {
    if (!input)
        return { min: undefined, max: undefined };
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
const parseFuelTypes = (input) => {
    if (!input)
        return [];
    return input
        .split(/[\/,|]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
};
const parseMonthYear = (input) => {
    if (!input)
        return { window: undefined, iso: undefined };
    const window = input.trim();
    const date = new Date(Date.parse(window));
    if (!isNaN(date.getTime())) {
        const iso = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
        return { window, iso };
    }
    return { window, iso: undefined };
};
const getAllUpcomingCars = async (req, res) => {
    try {
        const cars = await UpcomingCar_model_1.default.find().sort({ expectedLaunch: 1 });
        res.json(cars);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch upcoming cars" });
    }
};
exports.getAllUpcomingCars = getAllUpcomingCars;
const getUpcomingCarById = async (req, res) => {
    try {
        const car = await UpcomingCar_model_1.default.findOne({ id: req.params.id });
        if (!car)
            return res.status(404).json({ message: "Car not found" });
        res.json(car);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch upcoming car" });
    }
};
exports.getUpcomingCarById = getUpcomingCarById;
const createUpcomingCar = async (req, res) => {
    try {
        const car = await UpcomingCar_model_1.default.create(req.body);
        res.json(car);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create upcoming car" });
    }
};
exports.createUpcomingCar = createUpcomingCar;
const updateUpcomingCar = async (req, res) => {
    try {
        const car = await UpcomingCar_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(car);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update upcoming car" });
    }
};
exports.updateUpcomingCar = updateUpcomingCar;
const deleteUpcomingCar = async (req, res) => {
    try {
        await UpcomingCar_model_1.default.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Upcoming car deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete upcoming car" });
    }
};
exports.deleteUpcomingCar = deleteUpcomingCar;
const uploadUpcomingCarsCsv = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        if (!req.file) {
            return res.status(400).json({ error: "CSV file is required (field: file)" });
        }
        const csvText = req.file.buffer.toString("utf8");
        const records = (0, sync_1.parse)(csvText, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
        const results = [];
        for (const row of records) {
            const brandName = (_a = row["Brand"]) === null || _a === void 0 ? void 0 : _a.trim();
            const modelName = (_b = row["Model"]) === null || _b === void 0 ? void 0 : _b.trim();
            const segment = (_c = row["Segment"]) === null || _c === void 0 ? void 0 : _c.trim();
            const bodyType = (_d = row["Body Type"]) === null || _d === void 0 ? void 0 : _d.trim();
            const powertrain = (_e = row["Powertrain (expected)"]) === null || _e === void 0 ? void 0 : _e.trim();
            const launchStr = (_f = row["Expected Launch (Month/Year)"]) === null || _f === void 0 ? void 0 : _f.trim();
            const priceStr = (((_g = row["Expected Ex-Showroom Price (₹)"]) === null || _g === void 0 ? void 0 : _g.trim()) || ((_h = row["Expected Ex-Showroom ,Price (₹)"]) === null || _h === void 0 ? void 0 : _h.trim()));
            const notes = (_j = row["Notes"]) === null || _j === void 0 ? void 0 : _j.trim();
            if (!brandName || !modelName)
                continue;
            const brand = await Brand_model_1.default.findOne({ name: new RegExp(`^${brandName}$`, "i") });
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
            const keyFeatures = [];
            if (segment)
                keyFeatures.push(`Segment: ${segment}`);
            if (notes)
                keyFeatures.push(`Notes: ${notes}`);
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
            const existing = await UpcomingCar_model_1.default.findOne({ id });
            if (existing) {
                await UpcomingCar_model_1.default.updateOne({ id }, payload);
                results.push({ id, name: modelName, status: "updated" });
            }
            else {
                await UpcomingCar_model_1.default.create(payload);
                results.push({ id, name: modelName, status: "created" });
            }
        }
        res.json({ total: records.length, processed: results.length, results });
    }
    catch (error) {
        console.error("CSV upload error:", error);
        res.status(500).json({ error: "Failed to process CSV" });
    }
};
exports.uploadUpcomingCarsCsv = uploadUpcomingCarsCsv;
