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
    const gstRate = normalize(config.gstRate, 0.05);
    const rtoRate = normalize(config.rtoPercentage, 0.09);
    const insurancePct = normalize(config.insurancePercentage, 0.035);
    const registrationFee = (_a = config.registrationFee) !== null && _a !== void 0 ? _a : 2500;
    const tcsRate = normalize(config.tcsRate, 0.01); // Default 1%
    const fastagCharges = (_b = config.fastagCharges) !== null && _b !== void 0 ? _b : 500; // Default Rs. 500
    // Calculate Individual Registration (RTO includes road tax + registration + cess)
    const rtoAmount = exShowroomPrice * rtoRate;
    const rto = Math.round(rtoAmount + registrationFee);
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
    const onRoadPrice = exShowroomPrice + rto + insurance + otherCharges;
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
