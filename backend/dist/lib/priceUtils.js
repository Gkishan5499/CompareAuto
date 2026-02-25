"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePriceBreakdownWithConfig = exports.calcInsurance = exports.ALL_STATES = exports.getStateFromCity = exports.CITY_TO_STATE = void 0;
var cityStateMapping_1 = require("./cityStateMapping");
Object.defineProperty(exports, "CITY_TO_STATE", { enumerable: true, get: function () { return cityStateMapping_1.CITY_TO_STATE; } });
Object.defineProperty(exports, "getStateFromCity", { enumerable: true, get: function () { return cityStateMapping_1.getStateFromCity; } });
Object.defineProperty(exports, "ALL_STATES", { enumerable: true, get: function () { return cityStateMapping_1.ALL_STATES; } });
// Dynamic insurance calculator with segment/fuel/state uplifts
const calcInsurance = (input) => {
    const { exShowroom, fuelType, stateCode } = input;
    const notes = [];
    // Base percent by ex-showroom segment
    let basePercent = 0.056; // 5.6% typical for 5–10L petrol hatchbacks/CSUVs
    if (exShowroom < 500000) {
        basePercent = 0.058;
    }
    else if (exShowroom > 1000000 && exShowroom <= 2000000) {
        basePercent = 0.052;
    }
    else if (exShowroom > 2000000) {
        basePercent = 0.05;
    }
    const fuel = fuelType === null || fuelType === void 0 ? void 0 : fuelType.toLowerCase();
    if (fuel === "diesel") {
        basePercent += 0.002; // slight uplift for diesel
        notes.push("Diesel insurance uplift applied.");
    }
    else if (fuel === "ev" || fuel === "electric") {
        basePercent += 0.01; // EV batteries push higher OD premiums
        notes.push("EV insurance uplift applied.");
    }
    const upperState = (stateCode || "").toUpperCase();
    if (upperState === "KA" || upperState.includes("KARNATAKA")) {
        basePercent += 0.003; // KA often sees slightly higher quotes
        notes.push("Karnataka uplift applied (historically higher quotes).");
    }
    const premium = Math.round(exShowroom * basePercent);
    notes.push(`Approx insurance ~${(basePercent * 100).toFixed(2)}% of ex-showroom.`);
    return {
        premium,
        approxPercent: basePercent,
        notes,
    };
};
exports.calcInsurance = calcInsurance;
const calculatePriceBreakdownWithConfig = (exShowroomPrice, config, options) => {
    var _a, _b;
    // Normalize percentage fields: allow storing as 5 (meaning 5%) or 0.05
    const normalize = (v, defaultVal) => {
        if (v === undefined || v === null)
            return defaultVal;
        return v > 1 ? v / 100 : v;
    };
    // TCS is always stored as percentage (1 means 1%, not 0.01), so always divide by 100
    const normalizeTcs = (v, defaultVal) => {
        if (v === undefined || v === null)
            return defaultVal;
        return v / 100;
    };
    const gstRate = normalize(config.gstRate, 0.05);
    // Select RTO rate based on fuel type, falling back to legacy rtoPercentage
    let rtoRateValue;
    if (config.rtoByFuelType && (options === null || options === void 0 ? void 0 : options.fuelType)) {
        const fuelLower = options.fuelType.toLowerCase();
        if (fuelLower === 'ev' || fuelLower === 'electric') {
            rtoRateValue = config.rtoByFuelType.ev;
        }
        else if (fuelLower === 'cng') {
            rtoRateValue = config.rtoByFuelType.cng;
        }
        else if (fuelLower === 'diesel') {
            rtoRateValue = config.rtoByFuelType.diesel;
        }
        else if (fuelLower === 'hybrid') {
            rtoRateValue = config.rtoByFuelType.hybrid;
        }
        else if (fuelLower === 'petrol' || fuelLower === 'petrol/hybrid') {
            rtoRateValue = config.rtoByFuelType.petrol;
        }
    }
    let rtoRate = normalize(rtoRateValue !== null && rtoRateValue !== void 0 ? rtoRateValue : config.rtoPercentage, 0.09);
    // Apply variant-specific RTO multipliers (like CarDekho)
    // 1. Engine capacity based multiplier
    if (options === null || options === void 0 ? void 0 : options.engineCc) {
        const cc = options.engineCc;
        if (cc > 2000) {
            rtoRate *= 1.15; // +15% for >2000cc (luxury/performance)
        }
        else if (cc > 1500) {
            rtoRate *= 1.10; // +10% for 1500-2000cc (mid-size)
        }
        else if (cc > 1200) {
            rtoRate *= 1.05; // +5% for 1200-1500cc (compact+)
        }
        // Below 1200cc: no multiplier (base rate)
    }
    // 2. Seating capacity multiplier (more seats = commercial/utility category)
    if ((options === null || options === void 0 ? void 0 : options.seating) && options.seating > 7) {
        rtoRate *= 1.08; // +8% for 8+ seater (commercial category)
    }
    else if ((options === null || options === void 0 ? void 0 : options.seating) && options.seating === 7) {
        rtoRate *= 1.03; // +3% for 7-seater (family SUV/MPV)
    }
    // 3. Body type consideration (SUV/MUV typically higher)
    if (options === null || options === void 0 ? void 0 : options.bodyType) {
        const bodyLower = options.bodyType.toLowerCase();
        if (bodyLower.includes('suv') || bodyLower.includes('muv')) {
            rtoRate *= 1.02; // +2% for SUV/MUV
        }
    }
    // 4. Price slab multiplier (higher price = higher RTO rate)
    if (exShowroomPrice > 2000000) {
        rtoRate *= 1.20; // +20% for >20L (luxury segment)
    }
    else if (exShowroomPrice > 1500000) {
        rtoRate *= 1.12; // +12% for 15-20L (premium segment)
    }
    else if (exShowroomPrice > 1000000) {
        rtoRate *= 1.08; // +8% for 10-15L (mid-premium)
    }
    const insurancePct = normalize(config.insurancePercentage, 0.035);
    const registrationFee = (_a = config.registrationFee) !== null && _a !== void 0 ? _a : 2500;
    const tcsRate = normalizeTcs(config.tcsRate, 0.01); // Always treat as percentage
    const fastagCharges = (_b = config.fastagCharges) !== null && _b !== void 0 ? _b : 500; // Default Rs. 500
    // Calculate Individual Registration (RTO = road tax percentage only, registration fee shown separately)
    const rtoAmount = Math.round(exShowroomPrice * rtoRate);
    const rto = rtoAmount; // RTO percentage only
    const registration = registrationFee; // Keep registration fee separate
    // Calculate Insurance using smart logic
    const insuranceCalc = (0, exports.calcInsurance)({
        exShowroom: exShowroomPrice,
        fuelType: options === null || options === void 0 ? void 0 : options.fuelType,
        engineCc: options === null || options === void 0 ? void 0 : options.engineCc,
        stateCode: (options === null || options === void 0 ? void 0 : options.stateCode) || config.state,
    });
    const insurance = Number.isFinite(insuranceCalc.premium)
        ? insuranceCalc.premium
        : Math.round(exShowroomPrice * insurancePct);
    // Calculate TCS (Tax Collected at Source) - uses configured rate for vehicles ≥10 lakh
    const tcs = exShowroomPrice >= 1000000 ? Math.round(exShowroomPrice * tcsRate) : 0;
    // FASTag charges - uses configured value from database
    const fastag = fastagCharges;
    const otherCharges = tcs + fastag;
    const onRoadPrice = exShowroomPrice + rto + registration + insurance + otherCharges;
    return {
        exShowroomPrice,
        rto,
        insurance,
        tcs,
        fastag,
        otherCharges,
        onRoadPrice: Math.round(onRoadPrice),
    };
};
exports.calculatePriceBreakdownWithConfig = calculatePriceBreakdownWithConfig;
