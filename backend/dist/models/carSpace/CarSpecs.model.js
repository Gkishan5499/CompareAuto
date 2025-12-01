"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// 2. Schema – strict:false allows ALL new fields to be saved without defining them
const CarSpecsSchema = new mongoose_1.Schema({
    variantId: { type: String, required: true, unique: true },
    overview: {
        description: String,
        summary: String,
    },
    engine: {
        engine_cc: String,
        engine_type: String,
        cylinders: String,
        turbocharger: String,
        hybrid: String,
        battery: String,
        motor: String,
        emissionStandard: String,
    },
    performance: {
        mileage: String,
        drivingRange: String,
        idleStartStop: String,
        drivetrain: String,
        transmission: String,
    },
    dimensions: {
        length: String,
        width: String,
        height: String,
        wheelbase: String,
        kerbWeight: String,
        groundClearance: String,
        grossWeight: String,
    },
    safety: {
        airbags: String,
        ncapRating: String,
        abs: String,
        ebd: String,
        esp: String,
        tractionControl: String,
        hillHold: String,
        hillDescent: String,
        childSeatAnchor: String,
    },
    comfort: {
        ac: String,
        rearAC: String,
        cruiseControl: String,
        steeringAdjustment: String,
        parkingSensors: String,
    },
    lighting: {
        headlamps: String,
        drl: String,
        taillamps: String,
        foglamps: String,
    },
    media: {
        hero: String,
        gallery: [String],
    },
    interior: {
        upholstery: String,
        dashboard: String,
        colorTheme: String,
        armrests: String,
    },
    tech: {
        infotainment: String,
        speakers: String,
        androidAuto: String,
        appleCarPlay: String,
        bluetooth: String,
    },
    clusterDisplay: {
        screenType: String,
        avgFuel: String,
        distanceToEmpty: String,
        digitalSpeedo: String,
    },
    storage: {
        bottleHolders: String,
        cupHolders: String,
        bootSpace: String,
    },
    warranty: {
        vehicleWarranty: String,
        batteryWarranty: String,
    },
    // ⭐ NEW: Accept ANY new fields dynamically
}, {
    timestamps: true,
    strict: false, // <-- KEY LINE: Allows extra fields (ALL your new columns)
});
// 3. Export Model
exports.default = (0, mongoose_1.model)("CarSpecs", CarSpecsSchema);
