"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateModelVariantsPrices = exports.bulkUpdateVariantPrices = exports.updateVariantPrice = exports.deleteVariant = exports.updateVariant = exports.bulkCreateVariants = exports.createVariant = exports.getVariantsByModel = exports.getVariantById = exports.getAllVariants = void 0;
const Variant_model_1 = __importDefault(require("../models/Variant.model"));
const CarSpecs_model_1 = __importDefault(require("../models/carSpace/CarSpecs.model"));
const getAllVariants = async (req, res) => {
    try {
        const variants = await Variant_model_1.default.find().sort({ price: 1 });
        res.json(variants);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch variants" });
    }
};
exports.getAllVariants = getAllVariants;
const getVariantById = async (req, res) => {
    try {
        const variant = await Variant_model_1.default.findOne({ id: req.params.id });
        if (!variant)
            return res.status(404).json({ message: "Variant not found" });
        res.json(variant);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch variant" });
    }
};
exports.getVariantById = getVariantById;
const getVariantsByModel = async (req, res) => {
    try {
        const variants = await Variant_model_1.default.find({ modelId: req.params.modelId });
        res.json(variants);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch model variants" });
    }
};
exports.getVariantsByModel = getVariantsByModel;
const createVariant = async (req, res) => {
    try {
        let variantData = req.body;
        // Auto-generate ID if not provided
        if (!variantData.id || !variantData.id.trim()) {
            variantData.id = generateVariantId(variantData);
        }
        const variant = await Variant_model_1.default.create(variantData);
        res.json(variant);
    }
    catch (error) {
        console.error('Create variant error:', error);
        res.status(400).json({ error: "Failed to create variant", details: error.message });
    }
};
exports.createVariant = createVariant;
/**
 * Helper function to generate variant ID from variant data
 */
const generateVariantId = (variant) => {
    // If id is provided and not empty, use it
    if (variant.id && variant.id.trim()) {
        return variant.id;
    }
    // Generate ID from: modelId-name
    // Example: maruti-swift
    const slugify = (s) => String(s || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    const modelPart = variant.modelId ? slugify(variant.modelId) : 'model';
    const namePart = variant.name ? slugify(variant.name) : 'variant';
    return `${modelPart}-${namePart}`;
};
const bulkCreateVariants = async (req, res) => {
    var _a, _b;
    const { data } = req.body;
    try {
        if (!Array.isArray(data))
            return res.status(400).json({ error: "Invalid data" });
        // Debug first row
        if (data.length > 0) {
            console.log('Bulk import first row:', data[0]);
        }
        // Process each variant to generate ID if missing and add defaults
        const processedData = data.map(variant => {
            if (!variant.id || !variant.id.trim()) {
                variant.id = generateVariantId(variant);
            }
            // Add default values for required fields if missing
            if (!variant.fuelType)
                variant.fuelType = "Unknown";
            if (!variant.transmission)
                variant.transmission = "Unknown";
            // Normalize price: if < 1000, assume it's in lakhs and convert to rupees
            let price = Number(variant.price) || 0;
            let exShowroomPrice = Number(variant.exShowroomPrice) || price;
            if (price > 0 && price < 1000) {
                price = Math.round(price * 100000);
            }
            if (exShowroomPrice > 0 && exShowroomPrice < 1000) {
                exShowroomPrice = Math.round(exShowroomPrice * 100000);
            }
            variant.price = price;
            variant.exShowroomPrice = exShowroomPrice;
            return variant;
        });
        // Upsert variants so repeated imports refresh price/fuelType/etc.
        const variantOps = processedData.map(variant => {
            var _a, _b, _c;
            return ({
                updateOne: {
                    filter: { id: variant.id },
                    update: {
                        $set: {
                            modelId: variant.modelId,
                            name: variant.name,
                            slug: variant.slug,
                            price: (_a = variant.price) !== null && _a !== void 0 ? _a : 0,
                            exShowroomPrice: (_c = (_b = variant.exShowroomPrice) !== null && _b !== void 0 ? _b : variant.price) !== null && _c !== void 0 ? _c : 0,
                            fuelType: variant.fuelType,
                            transmission: variant.transmission,
                            engine: variant.engine,
                            mileage: variant.mileage,
                            seating: variant.seating,
                            colors: variant.colors || []
                        }
                    },
                    upsert: true
                }
            });
        });
        const variantResult = await Variant_model_1.default.bulkWrite(variantOps, { ordered: false });
        // Create or update corresponding CarSpecs records for each variant
        const specsToCreate = processedData.map(variant => {
            const csvSpecs = variant.specs || {};
            const specs = {
                variantId: variant.id,
            };
            // Overview
            const overviewData = {};
            if (csvSpecs.vehicle_overview)
                overviewData.vehicle_overview = csvSpecs.vehicle_overview;
            if (csvSpecs.description)
                overviewData.description = csvSpecs.description;
            if (csvSpecs.summary)
                overviewData.summary = csvSpecs.summary;
            if (csvSpecs.brand)
                overviewData.brand = csvSpecs.brand;
            if (csvSpecs.model)
                overviewData.model = csvSpecs.model;
            if (csvSpecs.variant)
                overviewData.variant = csvSpecs.variant;
            // Add price and fuel type to overview for display
            if (variant.fuelType)
                overviewData.fuel_type = variant.fuelType;
            if (variant.price || variant.exShowroomPrice)
                overviewData.ex_showroom_price = variant.price || variant.exShowroomPrice;
            if (Object.keys(overviewData).length > 0)
                specs.overview = overviewData;
            // Engine
            const engineData = {};
            if (variant.engine || csvSpecs.engine_cc)
                engineData.engine_cc = variant.engine || csvSpecs.engine_cc;
            if (csvSpecs.engine_type)
                engineData.engine_type = csvSpecs.engine_type;
            if (csvSpecs.cylinders)
                engineData.cylinders = csvSpecs.cylinders;
            if (csvSpecs.turbocharger)
                engineData.turbocharger = csvSpecs.turbocharger;
            if (csvSpecs.battery)
                engineData.battery = csvSpecs.battery;
            if (csvSpecs.electric_motor)
                engineData.motor = csvSpecs.electric_motor;
            if (csvSpecs.emission_standard)
                engineData.emissionStandard = csvSpecs.emission_standard;
            if (csvSpecs.max_power)
                engineData.max_power = csvSpecs.max_power;
            if (csvSpecs.max_torque)
                engineData.max_torque = csvSpecs.max_torque;
            if (csvSpecs.e20_compatibility)
                engineData.e20_compatibility = csvSpecs.e20_compatibility;
            if (csvSpecs.alternate_fuel)
                engineData.alternate_fuel = csvSpecs.alternate_fuel;
            if (csvSpecs.fuel_tank_capacity)
                engineData.fuel_tank_capacity = csvSpecs.fuel_tank_capacity;
            if (csvSpecs.cng_tank_capacity)
                engineData.cng_tank_capacity = csvSpecs.cng_tank_capacity;
            if (Object.keys(engineData).length > 0)
                specs.engine = engineData;
            // Performance
            const performanceData = {};
            if (variant.mileage || csvSpecs.mileage)
                performanceData.mileage = String(variant.mileage || csvSpecs.mileage);
            if (csvSpecs.driving_range)
                performanceData.drivingRange = csvSpecs.driving_range;
            if (csvSpecs.idle_start_stop)
                performanceData.idleStartStop = csvSpecs.idle_start_stop;
            if (csvSpecs.drivetrain)
                performanceData.drivetrain = csvSpecs.drivetrain;
            if (variant.transmission)
                performanceData.transmission = variant.transmission;
            if (csvSpecs.four_wheel_drive)
                performanceData.four_wheel_drive = csvSpecs.four_wheel_drive;
            if (csvSpecs.drive_modes_count)
                performanceData.drive_modes_count = csvSpecs.drive_modes_count;
            if (csvSpecs.terrain_modes_count)
                performanceData.terrain_modes_count = csvSpecs.terrain_modes_count;
            if (Object.keys(performanceData).length > 0)
                specs.performance = performanceData;
            // Dimensions
            const dimensionsData = {};
            if (variant.seating || csvSpecs.seating_capacity)
                dimensionsData.seating = String(variant.seating || csvSpecs.seating_capacity);
            if (csvSpecs.length)
                dimensionsData.length = csvSpecs.length;
            if (csvSpecs.width)
                dimensionsData.width = csvSpecs.width;
            if (csvSpecs.height)
                dimensionsData.height = csvSpecs.height;
            if (csvSpecs.wheelbase)
                dimensionsData.wheelbase = csvSpecs.wheelbase;
            if (csvSpecs.ground_clearance)
                dimensionsData.groundClearance = csvSpecs.ground_clearance;
            if (csvSpecs.kerb_weight)
                dimensionsData.kerbWeight = csvSpecs.kerb_weight;
            if (csvSpecs.gross_weight)
                dimensionsData.grossWeight = csvSpecs.gross_weight;
            if (csvSpecs.no_of_rows)
                dimensionsData.no_of_rows = csvSpecs.no_of_rows;
            if (csvSpecs.doors)
                dimensionsData.doors = csvSpecs.doors;
            if (csvSpecs.bootspace)
                dimensionsData.bootspace = csvSpecs.bootspace;
            if (csvSpecs.minimum_turning_radius)
                dimensionsData.minimum_turning_radius = csvSpecs.minimum_turning_radius;
            if (Object.keys(dimensionsData).length > 0)
                specs.dimensions = dimensionsData;
            // Safety
            const safetyData = {};
            if (csvSpecs.airbags)
                safetyData.airbags = csvSpecs.airbags;
            if (csvSpecs.ncap_rating)
                safetyData.ncapRating = csvSpecs.ncap_rating;
            if (csvSpecs.abs)
                safetyData.abs = csvSpecs.abs;
            if (csvSpecs.ebd)
                safetyData.ebd = csvSpecs.ebd;
            if (csvSpecs.esp)
                safetyData.esp = csvSpecs.esp;
            if (csvSpecs.traction_control)
                safetyData.tractionControl = csvSpecs.traction_control;
            if (csvSpecs.hill_hold_control)
                safetyData.hillHold = csvSpecs.hill_hold_control;
            if (csvSpecs.hill_descent_control)
                safetyData.hillDescent = csvSpecs.hill_descent_control;
            if (csvSpecs.seatbelt_type)
                safetyData.seatbelt_type = csvSpecs.seatbelt_type;
            if (csvSpecs.child_seat_anchor_points)
                safetyData.child_seat_anchor_points = csvSpecs.child_seat_anchor_points;
            if (csvSpecs.overspeed_warning)
                safetyData.overspeed_warning = csvSpecs.overspeed_warning;
            if (csvSpecs.lane_departure_warning)
                safetyData.lane_departure_warning = csvSpecs.lane_departure_warning;
            if (csvSpecs.lane_departure_prevention)
                safetyData.lane_departure_prevention = csvSpecs.lane_departure_prevention;
            if (csvSpecs.forward_collision_warning)
                safetyData.forward_collision_warning = csvSpecs.forward_collision_warning;
            if (csvSpecs.automatic_emergency_braking)
                safetyData.automatic_emergency_braking = csvSpecs.automatic_emergency_braking;
            if (csvSpecs.tyre_pressure_monitoring_system)
                safetyData.tyre_pressure_monitoring_system = csvSpecs.tyre_pressure_monitoring_system;
            if (csvSpecs.high_beam_assist)
                safetyData.high_beam_assist = csvSpecs.high_beam_assist;
            if (Object.keys(safetyData).length > 0)
                specs.safety = safetyData;
            // Comfort
            const comfortData = {};
            if (csvSpecs.air_conditioner)
                comfortData.air_conditioner = csvSpecs.air_conditioner;
            if (csvSpecs.air_conditioner_automatic_zones)
                comfortData.air_conditioner_automatic_zones = csvSpecs.air_conditioner_automatic_zones;
            if (csvSpecs.front_ac)
                comfortData.front_ac = csvSpecs.front_ac;
            if (csvSpecs.rear_ac)
                comfortData.rear_ac = csvSpecs.rear_ac;
            if (csvSpecs.heater)
                comfortData.heater = csvSpecs.heater;
            if (csvSpecs.cruise_control)
                comfortData.cruise_control = csvSpecs.cruise_control;
            if (csvSpecs.parking_sensors)
                comfortData.parking_sensors = csvSpecs.parking_sensors;
            if (csvSpecs.keyless_start)
                comfortData.keyless_start = csvSpecs.keyless_start;
            if (csvSpecs.power_windows)
                comfortData.power_windows = csvSpecs.power_windows;
            if (csvSpecs.steering_adjustment)
                comfortData.steering_adjustment = csvSpecs.steering_adjustment;
            if (Object.keys(comfortData).length > 0)
                specs.comfort = comfortData;
            // Lighting
            const lightingData = {};
            if (csvSpecs.headlights)
                lightingData.headlights = csvSpecs.headlights;
            if (csvSpecs.automatic_headlamps)
                lightingData.automatic_headlamps = csvSpecs.automatic_headlamps;
            if (csvSpecs.taillights)
                lightingData.taillights = csvSpecs.taillights;
            if (csvSpecs.daytime_running_lights)
                lightingData.daytime_running_lights = csvSpecs.daytime_running_lights;
            if (csvSpecs.fog_lights)
                lightingData.fog_lights = csvSpecs.fog_lights;
            if (csvSpecs.ambient_interior_lighting)
                lightingData.ambient_interior_lighting = csvSpecs.ambient_interior_lighting;
            if (Object.keys(lightingData).length > 0)
                specs.lighting = lightingData;
            // Interior
            const interiorData = {};
            if (csvSpecs.seat_upholstery)
                interiorData.seat_upholstery = csvSpecs.seat_upholstery;
            if (csvSpecs.driver_seat_adjust)
                interiorData.driver_seat_adjust = csvSpecs.driver_seat_adjust;
            if (csvSpecs.leather_wrapped_steering_wheel)
                interiorData.leather_wrapped_steering_wheel = csvSpecs.leather_wrapped_steering_wheel;
            if (csvSpecs.interior_colors)
                interiorData.interior_colors = csvSpecs.interior_colors;
            if (Object.keys(interiorData).length > 0)
                specs.interior = interiorData;
            // Tech
            const techData = {};
            if (csvSpecs.infotainment_screen)
                techData.infotainment_screen = csvSpecs.infotainment_screen;
            if (csvSpecs.speakers)
                techData.speakers = csvSpecs.speakers;
            if (csvSpecs.android_auto)
                techData.android_auto = csvSpecs.android_auto;
            if (csvSpecs.apple_carplay)
                techData.apple_carplay = csvSpecs.apple_carplay;
            if (csvSpecs.bluetooth)
                techData.bluetooth = csvSpecs.bluetooth;
            if (csvSpecs.wireless_charger)
                techData.wireless_charger = csvSpecs.wireless_charger;
            if (csvSpecs.steering_mounted_controls)
                techData.steering_mounted_controls = csvSpecs.steering_mounted_controls;
            if (csvSpecs.phone_app)
                techData.phone_app = csvSpecs.phone_app;
            if (Object.keys(techData).length > 0)
                specs.tech = techData;
            // Warranty
            const warrantyData = {};
            if (csvSpecs.vehicle_warranty)
                warrantyData.vehicle_warranty = csvSpecs.vehicle_warranty;
            if (csvSpecs.battery_warranty)
                warrantyData.battery_warranty = csvSpecs.battery_warranty;
            if (Object.keys(warrantyData).length > 0)
                specs.warranty = warrantyData;
            // Additional - everything else
            const additionalData = {};
            if (variant.colors && Array.isArray(variant.colors))
                additionalData.colors = variant.colors.join(', ');
            if (csvSpecs.sunroof)
                additionalData.sunroof = csvSpecs.sunroof;
            if (csvSpecs.wheels)
                additionalData.wheels = csvSpecs.wheels;
            if (csvSpecs.tyre_size)
                additionalData.tyre_size = csvSpecs.tyre_size;
            if (csvSpecs.front_suspension)
                additionalData.front_suspension = csvSpecs.front_suspension;
            if (csvSpecs.rear_suspension)
                additionalData.rear_suspension = csvSpecs.rear_suspension;
            if (csvSpecs.front_brakes)
                additionalData.front_brakes = csvSpecs.front_brakes;
            if (csvSpecs.rear_brakes)
                additionalData.rear_brakes = csvSpecs.rear_brakes;
            if (csvSpecs.steering_type)
                additionalData.steering_type = csvSpecs.steering_type;
            // Add remaining uncategorized specs
            Object.keys(csvSpecs).forEach(key => {
                if (!['vehicle_overview', 'description', 'summary', 'brand', 'model', 'variant',
                    'engine_type', 'cylinders', 'turbocharger', 'battery', 'electric_motor', 'emission_standard',
                    'max_power', 'max_torque', 'e20_compatibility', 'alternate_fuel', 'fuel_tank_capacity', 'cng_tank_capacity',
                    'mileage', 'driving_range', 'idle_start_stop', 'drivetrain', 'four_wheel_drive', 'drive_modes_count', 'terrain_modes_count',
                    'seating_capacity', 'length', 'width', 'height', 'wheelbase', 'ground_clearance', 'kerb_weight', 'gross_weight',
                    'no_of_rows', 'doors', 'bootspace', 'minimum_turning_radius',
                    'airbags', 'ncap_rating', 'abs', 'ebd', 'esp', 'traction_control', 'hill_hold_control', 'hill_descent_control',
                    'seatbelt_type', 'child_seat_anchor_points', 'overspeed_warning', 'lane_departure_warning', 'lane_departure_prevention',
                    'forward_collision_warning', 'automatic_emergency_braking', 'tyre_pressure_monitoring_system', 'high_beam_assist',
                    'air_conditioner', 'air_conditioner_automatic_zones', 'front_ac', 'rear_ac', 'heater', 'cruise_control',
                    'parking_sensors', 'keyless_start', 'power_windows', 'steering_adjustment',
                    'headlights', 'automatic_headlamps', 'taillights', 'daytime_running_lights', 'fog_lights', 'ambient_interior_lighting',
                    'seat_upholstery', 'driver_seat_adjust', 'leather_wrapped_steering_wheel', 'interior_colors',
                    'infotainment_screen', 'speakers', 'android_auto', 'apple_carplay', 'bluetooth', 'wireless_charger',
                    'steering_mounted_controls', 'phone_app',
                    'vehicle_warranty', 'battery_warranty',
                    'sunroof', 'wheels', 'tyre_size', 'front_suspension', 'rear_suspension', 'front_brakes', 'rear_brakes', 'steering_type'
                ].includes(key)) {
                    additionalData[key] = csvSpecs[key];
                }
            });
            if (Object.keys(additionalData).length > 0)
                specs.additional = additionalData;
            return specs;
        });
        const specsOps = specsToCreate.map(specs => ({
            updateOne: {
                filter: { variantId: specs.variantId },
                update: { $set: specs },
                upsert: true
            }
        }));
        try {
            await CarSpecs_model_1.default.bulkWrite(specsOps, { ordered: false });
            console.log(`Upserted ${specsOps.length} CarSpecs records`);
        }
        catch (specsErr) {
            console.log('Some specs upserts failed:', specsErr.message);
        }
        res.json({
            variants: variantResult,
            specsUpserted: specsOps.length
        });
    }
    catch (err) {
        console.error('Bulk create variants error:', err);
        // If some succeeded and some failed, return partial success
        if (err.writeErrors) {
            const successCount = ((_a = err.insertedDocs) === null || _a === void 0 ? void 0 : _a.length) || 0;
            const failedCount = ((_b = err.writeErrors) === null || _b === void 0 ? void 0 : _b.length) || 0;
            return res.status(207).json({
                message: `Partial success: ${successCount} created, ${failedCount} failed`,
                created: err.insertedDocs || [],
                errors: err.writeErrors.map((e) => ({
                    index: e.index,
                    message: e.errmsg,
                    data: data[e.index]
                }))
            });
        }
        res.status(400).json({ error: "Failed to bulk create variants", details: err.message });
    }
};
exports.bulkCreateVariants = bulkCreateVariants;
const updateVariant = async (req, res) => {
    try {
        const variant = await Variant_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(variant);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update variant" });
    }
};
exports.updateVariant = updateVariant;
const deleteVariant = async (req, res) => {
    try {
        await Variant_model_1.default.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Variant deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete variant" });
    }
};
exports.deleteVariant = deleteVariant;
/**
 * Update ex-showroom price for a single variant
 */
const updateVariantPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { exShowroomPrice, price } = req.body;
        if (exShowroomPrice === undefined && price === undefined) {
            return res.status(400).json({ error: "Either exShowroomPrice or price must be provided" });
        }
        const updateData = {};
        if (exShowroomPrice !== undefined)
            updateData.exShowroomPrice = exShowroomPrice;
        if (price !== undefined)
            updateData.price = price;
        const variant = await Variant_model_1.default.findOneAndUpdate({ id }, updateData, { new: true });
        if (!variant)
            return res.status(404).json({ message: "Variant not found" });
        res.json(variant);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update variant price" });
    }
};
exports.updateVariantPrice = updateVariantPrice;
/**
 * Bulk update prices for multiple variants
 */
const bulkUpdateVariantPrices = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { id, exShowroomPrice, price }
        if (!Array.isArray(updates)) {
            return res.status(400).json({ error: "Updates must be an array" });
        }
        if (updates.length === 0) {
            return res.status(400).json({ error: "No variants to update" });
        }
        const results = await Promise.all(updates.map(async (update) => {
            const { id, exShowroomPrice, price } = update;
            if (!id) {
                return { error: "Variant ID is required", id };
            }
            const updateData = {};
            if (exShowroomPrice !== undefined)
                updateData.exShowroomPrice = exShowroomPrice;
            if (price !== undefined)
                updateData.price = price;
            if (Object.keys(updateData).length === 0) {
                return { error: "No price fields provided", id };
            }
            const variant = await Variant_model_1.default.findOneAndUpdate({ id }, updateData, { new: true });
            if (!variant) {
                return { error: "Variant not found", id };
            }
            return variant;
        }));
        const updated = results.filter((r) => !r.error);
        const failed = results.filter((r) => r.error);
        res.json({
            totalRequested: updates.length,
            successfulUpdates: updated.length,
            failedUpdates: failed.length,
            updated,
            ...(failed.length > 0 && { failed }),
        });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to bulk update variant prices" });
    }
};
exports.bulkUpdateVariantPrices = bulkUpdateVariantPrices;
/**
 * Update prices for all variants of a model (percentage or fixed amount)
 */
const updateModelVariantsPrices = async (req, res) => {
    try {
        const { modelId } = req.params;
        const { type, value } = req.body; // type: 'percentage' | 'fixed', value: number
        if (!type || !["percentage", "fixed"].includes(type)) {
            return res.status(400).json({ error: "Type must be 'percentage' or 'fixed'" });
        }
        if (value === undefined || typeof value !== "number") {
            return res.status(400).json({ error: "Value must be a number" });
        }
        const variants = await Variant_model_1.default.find({ modelId });
        if (variants.length === 0) {
            return res.status(404).json({ message: `No variants found for model ${modelId}` });
        }
        const results = await Promise.all(variants.map(async (variant) => {
            const currentPrice = variant.exShowroomPrice || variant.price;
            let newPrice;
            if (type === "percentage") {
                newPrice = Math.round(currentPrice * (1 + value / 100));
            }
            else {
                newPrice = currentPrice + value;
            }
            return Variant_model_1.default.findOneAndUpdate({ id: variant.id }, { exShowroomPrice: newPrice, price: newPrice }, { new: true });
        }));
        res.json({
            modelId,
            variantsUpdated: results.length,
            updateType: type,
            updateValue: value,
            variants: results,
        });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update model variant prices" });
    }
};
exports.updateModelVariantsPrices = updateModelVariantsPrices;
