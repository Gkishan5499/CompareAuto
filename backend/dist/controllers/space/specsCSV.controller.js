"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSpecsCsv = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_parse_1 = require("csv-parse");
const Brand_model_1 = __importDefault(require("../../models/Brand.model"));
const CarModel_model_1 = __importDefault(require("../../models/CarModel.model"));
const Variant_model_1 = __importDefault(require("../../models/Variant.model"));
const CarSpecs_model_1 = __importDefault(require("../../models/carSpace/CarSpecs.model"));
const csvMapping_1 = require("../../utils/csvMapping");
// =============================
// DEFAULT MAPPING (extendable)
// =============================
const DEFAULT_MAPPING = {
    // linking
    brand: "overview.brand",
    model: "overview.model",
    variant: "overview.variant",
    variant_id: "variantId",
    variantId: "variantId",
    // overview
    description: "overview.description",
    summary: "overview.summary",
    body_type: "overview.body_type",
    seating_capacity: "overview.seating_capacity",
    // engine
    engine_cc: "engine.engine_cc",
    cylinders: "engine.cylinders",
    engine_type: "engine.engine_type",
    turbocharger: "engine.turbocharger",
    hybrid: "engine.hybrid",
    battery: "engine.battery",
    electric_motor: "engine.motor",
    emission_standard: "engine.emissionStandard",
    // performance
    mileage_raw: "performance.mileage",
    driving_range_raw: "performance.drivingRange",
    idle_start_stop: "performance.idleStartStop",
    drivetrain: "performance.drivetrain",
    transmission: "performance.transmission",
    // dimensions
    length_mm_raw: "dimensions.length",
    width_mm_raw: "dimensions.width",
    height_mm_raw: "dimensions.height",
    wheelbase_mm_raw: "dimensions.wheelbase",
    kerb_weight_kg_raw: "dimensions.kerbWeight",
    ground_clearance_mm_raw: "dimensions.groundClearance",
    gross_weight_kg_raw: "dimensions.grossWeight",
    // safety
    airbags_raw: "safety.airbags",
    ncap_rating_raw: "safety.ncapRating",
    abs_raw: "safety.abs",
    ebd_raw: "safety.ebd",
    esp_raw: "safety.esp",
    traction_control_raw: "safety.tractionControl",
    hill_hold_control_raw: "safety.hillHold",
    hill_descent_control: "safety.hillDescent",
    child_seat_anchor_points: "safety.childSeatAnchor",
    // comfort
    air_conditioner: "comfort.ac",
    rear_ac_raw: "comfort.rearAC",
    cruise_control: "comfort.cruiseControl",
    steering_adjustment: "comfort.steeringAdjustment",
    parking_sensors: "comfort.parkingSensors",
    // lighting
    headlights_raw: "lighting.headlamps",
    daytime_running_lights: "lighting.drl",
    taillights_raw: "lighting.taillamps",
    fog_lights_raw: "lighting.foglamps",
    // media
    hero: "media.hero",
    gallery: "media.gallery",
    // interior
    seat_upholstery_raw: "interior.upholstery",
    interior_colors_raw: "interior.colorTheme",
    driver_armrest: "interior.armrests",
    // tech / connectivity
    infotainment_screen_raw: "tech.infotainment",
    speakers_raw: "tech.speakers",
    android_auto_raw: "tech.androidAuto",
    apple_carplay_raw: "tech.appleCarPlay",
    bluetooth_raw: "tech.bluetooth",
    // warranty
    vehicle_warranty_raw: "warranty.vehicleWarranty",
    battery_warranty_raw: "warranty.batteryWarranty",
    // broader fields
    vehicle_overview: "overview.vehicle_overview",
    ex_showroom_price: "overview.price",
    ex_showroom_price_1: "overview.price_1",
    exterior_design: "exterior.design",
    sunroof: "exterior.sunroof",
    spoiler: "exterior.spoiler",
    roof_rails: "exterior.roofRails",
    grille: "exterior.grille",
    bumpers: "exterior.bumpers",
    antenna: "exterior.antenna",
    seatbelt_type: "safety.seatbeltType",
    speed_assist_system: "safety.speedAssist",
    skid_plates: "safety.skidPlates",
    overspeed_warning: "safety.overspeedWarning",
    rear_middle_three_point_seatbelt: "safety.rearMiddleThreePointSeatbelt",
    rear_middle_head_rest: "safety.rearMiddleHeadrest",
    front_ac: "comfort.frontAC",
    heater: "comfort.heater",
    keyless_start_button_start: "comfort.keylessStart",
    electronic_parking_brake: "comfort.electronicParkingBrake",
    tyre_inflator: "comfort.tyreInflator",
    cabin_boot_access: "comfort.cabinBootAccess",
    headlight_height_adjuster: "lighting.headlightHeightAdjuster",
    automatic_headlamps: "lighting.automaticHeadlamps",
    daytime_running_lights_1: "lighting.drl",
    stop_lamp: "lighting.stopLamp",
    reading_lamp: "lighting.readingLamp",
    abs: "safety.abs",
    ebd: "safety.ebd",
    esp: "safety.esp",
    traction_control_system: "safety.tractionControl",
    vehicle_tracking_via_app: "connectivity.vehicleTracking",
    phone_app: "connectivity.phoneApp",
    ota_updates_raw: "tech.otaUpdates",
    ota_updates: "tech.otaUpdates",
    average_fuel_consumption: "clusterDisplay.avgFuel",
    distance_to_empty: "clusterDisplay.distanceToEmpty",
    low_fuel_level_warning: "clusterDisplay.lowFuelLevelWarning",
    speedometer: "clusterDisplay.speedometer",
    instrument_cluster_screen_type: "clusterDisplay.screenType",
    trip_meter: "clusterDisplay.tripMeter",
    bottle_holder_in_doors: "storage.bottleHolders",
    cup_holders_position: "storage.cupHolders",
    bootspace: "storage.bootSpace",
    boot_space: "storage.bootSpace",
    warranty_coverage: "warranty.vehicleWarranty",
    vehicle_warranty: "warranty.vehicleWarranty",
    battery_warranty: "warranty.batteryWarranty",
    wheels: "wheels",
    body_colours: "exterior.body_colours",
    ground_clearance: "dimensions.groundClearance",
    gross_vehicle_weight: "dimensions.grossWeight",
    number_of_rows: "overview.number_of_rows",
    number_of_doors: "overview.number_of_doors",
    tyre_size: "wheels.tyre_size",
    tyre_size_1: "wheels.tyre_size_1",
    front_suspension: "drive_dynamics.front_suspension",
    rear_suspension: "drive_dynamics.rear_suspension",
    front_brakes: "drive_dynamics.front_brakes",
    rear_brakes: "drive_dynamics.rear_brakes",
    steering_type: "drive_dynamics.steering_type",
    power_windows: "interior.power_windows",
    ventilated_seats: "interior.ventilated_seats",
    ventilated_seat_type: "interior.ventilated_seat_type",
    ambient_interior_lighting: "interior.ambient_interior_lighting",
    follow_me_home_headlamps: "lighting.follow_me_home_headlamps",
    puddle_lamps: "lighting.puddle_lamps",
    anti_theft_immobilisation: "security.anti_theft_immobilisation",
    remote_engine_start_stop: "connectivity.remote_engine_start_stop",
    remote_parking_with_key: "connectivity.remote_parking_with_key",
    remote_ac_on_off_via_app: "connectivity.remote_ac_on_off_via_app",
    digital_key: "connectivity.digital_key",
    remote_car_start_stop: "connectivity.remote_car_start_stop",
    // (duplicate removed) remote_ac_on_off_via_app: "connectivity.remote_ac_on_off",
    drive_modes_count: "drive_dynamics.drive_modes_count",
    terrain_modes_count: "drive_dynamics.terrain_modes_count",
    air_conditioner_automatic_zones: "comfort.air_conditioner_automatic_zones",
    third_row_ac_zone: "comfort.third_row_ac_zone",
    air_purifier: "comfort.air_purifier",
    honeywell_unknown_dummy_for_backward_compatibility: "extras.honeywell_dummy"
};
// =============================
// MAIN CSV UPLOAD HANDLER
// =============================
const uploadSpecsCsv = async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });
    const filePath = req.file.path;
    const report = {
        totalRows: 0,
        createdBrands: 0,
        createdModels: 0,
        createdVariants: 0,
        createdSpecs: 0,
        updatedSpecs: 0,
        failed: 0,
        errors: [],
    };
    // =============================
    // HANDLE optional custom mapping
    // =============================
    let mapping = DEFAULT_MAPPING;
    try {
        if (req.body.mapping) {
            const providedMapping = JSON.parse(req.body.mapping);
            // Build an 'effective' mapping: CSV header -> nested path
            const effective = {};
            for (const [csvKey, target] of Object.entries(providedMapping)) {
                const k = String(csvKey).trim();
                const t = String(target || "").trim();
                if (!t)
                    continue;
                if (t.indexOf(".") >= 0) {
                    effective[k.toLowerCase()] = t; // already nested path
                }
                else if (DEFAULT_MAPPING[t]) {
                    // if provided value is a known short-key, map to default nested path
                    effective[k.toLowerCase()] = DEFAULT_MAPPING[t];
                }
                else {
                    // otherwise accept whatever string provided; will be treated as raw path
                    effective[k.toLowerCase()] = t;
                }
            }
            // merge over defaults (defaults are keyed by known csv keys): transform DEFAULT_MAPPING keys to be lowercase as well
            const base = {};
            for (const [k, v] of Object.entries(DEFAULT_MAPPING))
                base[String(k).trim().toLowerCase()] = v;
            mapping = { ...base, ...effective };
        }
    }
    catch (e) {
        console.warn("Invalid custom mapping, using default");
    }
    // Normalize mapping keys to lower-case trimmed keys for case-insensitive matching
    const normalizedMapping = {};
    for (const [k, v] of Object.entries(mapping))
        normalizedMapping[String(k).trim().toLowerCase()] = v;
    mapping = normalizedMapping;
    // =============================
    // START STREAMING CSV PARSER
    // =============================
    const parser = fs_1.default.createReadStream(filePath).pipe((0, csv_parse_1.parse)({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
    }));
    for await (const row of parser) {
        report.totalRows++;
        try {
            const normalizedRow = {};
            for (const k of Object.keys(row)) {
                normalizedRow[String(k).trim().toLowerCase()] = row[k];
            }
            // convert raw row + mapping → nested CarSpecs object
            const specsObj = (0, csvMapping_1.mapRowToSpecs)(normalizedRow, mapping);
            // =============================
            // Extract brand / model / variant
            // =============================
            const brandName = normalizedRow.brand || ((_a = specsObj === null || specsObj === void 0 ? void 0 : specsObj.overview) === null || _a === void 0 ? void 0 : _a.brand);
            const modelName = normalizedRow.model || ((_b = specsObj === null || specsObj === void 0 ? void 0 : specsObj.overview) === null || _b === void 0 ? void 0 : _b.model);
            const variantName = normalizedRow.variant || ((_c = specsObj === null || specsObj === void 0 ? void 0 : specsObj.overview) === null || _c === void 0 ? void 0 : _c.variant);
            if (!brandName || !modelName || !variantName) {
                report.failed++;
                report.errors.push({
                    row: report.totalRows,
                    reason: "Missing brand / model / variant",
                });
                continue;
            }
            // SLUGIFY HELPER
            const slugify = (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, "-");
            // =============================
            // UPSERT BRAND
            // =============================
            let brand = await Brand_model_1.default.findOne({ name: brandName });
            if (!brand) {
                brand = await Brand_model_1.default.create({
                    id: slugify(brandName),
                    name: brandName,
                    slug: slugify(brandName),
                    logo: "/brands/default.png",
                    country: "Unknown",
                });
                report.createdBrands++;
            }
            // =============================
            // UPSERT MODEL
            // =============================
            let carModel = await CarModel_model_1.default.findOne({ name: modelName, brandId: brand.id });
            if (!carModel) {
                carModel = await CarModel_model_1.default.create({
                    id: slugify(modelName),
                    brandId: brand.id,
                    brandName: brand.name,
                    name: modelName,
                    slug: slugify(modelName),
                    image: ((_d = specsObj.media) === null || _d === void 0 ? void 0 : _d.hero) || "/cars/default.png",
                    bodyType: ((_e = specsObj.overview) === null || _e === void 0 ? void 0 : _e.body_type) || "",
                    variantCount: 0,
                    priceRange: {},
                    status: "on_sale",
                });
                report.createdModels++;
            }
            // =============================
            // UPSERT VARIANT
            // =============================
            const variantId = normalizedRow.variant_id ||
                normalizedRow.variantId ||
                `${carModel.id}-${slugify(variantName)}`;
            let variant = await Variant_model_1.default.findOne({ id: variantId });
            if (!variant) {
                // ensure variant-level values are scalar (not arrays) and parsed correctly
                const pick = (paths) => {
                    for (const p of paths) {
                        const parts = p.split('.');
                        let cur = specsObj;
                        for (const part of parts) {
                            if (!cur || typeof cur !== 'object') {
                                cur = undefined;
                                break;
                            }
                            cur = cur[part];
                        }
                        if (cur !== undefined && cur !== null && String(cur).trim() !== '')
                            return cur;
                    }
                    return undefined;
                };
                const priceRaw = pick(['overview.price', 'ex_showroom_price', 'price', 'variant.price']) || 0;
                const priceNum = typeof priceRaw === 'string' && priceRaw !== '' ? parseFloat(priceRaw.replace(/[^0-9.]/g, '')) : Number(priceRaw) || 0;
                let transmissionVal = pick(['performance.transmission', 'transmission', 'variant.transmission']);
                if (Array.isArray(transmissionVal))
                    transmissionVal = transmissionVal.join(', ');
                if (transmissionVal === undefined || transmissionVal === null || String(transmissionVal).trim() === '')
                    transmissionVal = 'Unknown';
                let fuelTypeVal = pick(['fuel_type', 'fuelType', 'variant.fuelType']);
                if (Array.isArray(fuelTypeVal))
                    fuelTypeVal = fuelTypeVal.join(', ');
                if (fuelTypeVal === undefined || fuelTypeVal === null || String(fuelTypeVal).trim() === '')
                    fuelTypeVal = 'Unknown';
                let mileageVal = pick(['performance.mileage', 'mileage_raw', 'mileage']);
                if (Array.isArray(mileageVal))
                    mileageVal = mileageVal[0];
                const mileageNum = mileageVal ? Number(String(mileageVal).replace(/[^0-9.]/g, '')) : undefined;
                let seatingVal = pick(['seating_capacity', 'seating', 'seating_capacity_raw']);
                if (Array.isArray(seatingVal))
                    seatingVal = seatingVal[0];
                const seatingNum = seatingVal ? parseInt(String(seatingVal).replace(/[^0-9]/g, ''), 10) : undefined;
                variant = await Variant_model_1.default.create({
                    id: variantId,
                    modelId: carModel.id,
                    name: variantName,
                    slug: slugify(variantName),
                    price: priceNum,
                    fuelType: fuelTypeVal,
                    transmission: String(transmissionVal),
                    mileage: mileageNum,
                    seating: seatingNum,
                });
                report.createdVariants++;
                // increase variant count
                await CarModel_model_1.default.updateOne({ id: carModel.id }, { $inc: { variantCount: 1 } });
            }
            // =============================
            // PREPARE SPECS OBJECT: normalize array/string types and guard schema expectations
            // =============================
            // Convert gallery string → array
            if (((_f = specsObj.media) === null || _f === void 0 ? void 0 : _f.gallery) && typeof specsObj.media.gallery === "string") {
                specsObj.media.gallery = specsObj.media.gallery
                    .split(/[;,|]+/)
                    .map((v) => v.trim())
                    .filter(Boolean);
            }
            // Helper to walk and normalize arrays in the specsObj
            const allowedArrays = new Set(["media.gallery", "model.colors", "colors", "wheels"]);
            const normalizeArrays = (obj, path = "") => {
                if (!obj || typeof obj !== 'object')
                    return;
                for (const key of Object.keys(obj)) {
                    const curPath = path ? `${path}.${key}` : key;
                    const val = obj[key];
                    if (Array.isArray(val)) {
                        if (!allowedArrays.has(curPath)) {
                            // Keep arrays as strings for fields expecting scalar values
                            obj[key] = val.join(', ');
                        }
                        // else keep as array
                    }
                    else if (val && typeof val === 'object') {
                        normalizeArrays(val, curPath);
                    }
                    else {
                        // scalar stays as-is
                    }
                }
            };
            normalizeArrays(specsObj);
            specsObj.variantId = variantId;
            specsObj.overview = {
                brand: brand.name,
                model: carModel.name,
                variant: variant.name,
                ...specsObj.overview,
            };
            // =============================
            // UPSERT CAR SPECS
            // =============================
            const existingSpecs = await CarSpecs_model_1.default.findOne({ variantId });
            if (!existingSpecs) {
                await CarSpecs_model_1.default.create(specsObj);
                report.createdSpecs++;
            }
            else {
                await CarSpecs_model_1.default.updateOne({ variantId }, { $set: specsObj });
                report.updatedSpecs++;
            }
        }
        catch (error) {
            report.failed++;
            report.errors.push({
                row: report.totalRows,
                reason: error.message || String(error),
            });
        }
    }
    // clean temp file
    try {
        fs_1.default.unlinkSync(filePath);
    }
    catch { }
    return res.json({
        message: "CSV Import Completed",
        report,
    });
};
exports.uploadSpecsCsv = uploadSpecsCsv;
