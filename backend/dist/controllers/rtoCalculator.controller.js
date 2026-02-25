"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRTORatesController = exports.bulkCalculateRTOController = exports.calculateRTOController = void 0;
const rtoCalculator_1 = require("../utils/rtoCalculator");
/**
 * Calculate RTO for a single vehicle
 * POST /api/pricing/calculate-rto
 */
const calculateRTOController = async (req, res) => {
    try {
        const { state, exShowroomPrice, fuelType, engineCapacity, vehicleType, vehicleAge, includeTaxes = false, gstRate = 5, insurancePercentage = 3, tcsRate = 1, fastagCharges = 500, } = req.body;
        // Validate required fields
        if (!state || exShowroomPrice === undefined || !fuelType) {
            return res.status(400).json({
                error: 'Missing required fields: state, exShowroomPrice, fuelType',
            });
        }
        const input = {
            state,
            exShowroomPrice: Number(exShowroomPrice),
            fuelType,
            engineCapacity: engineCapacity ? Number(engineCapacity) : undefined,
            vehicleType,
            vehicleAge: vehicleAge ? Number(vehicleAge) : 0,
        };
        const rtoResult = (0, rtoCalculator_1.calculateRTO)(input);
        // If breakdown requested
        if (includeTaxes) {
            const onRoadCalculation = (0, rtoCalculator_1.calculateOnRoadPrice)(input.exShowroomPrice, rtoResult, gstRate, insurancePercentage, tcsRate, fastagCharges);
            return res.json({
                success: true,
                input,
                rto: rtoResult,
                pricing: onRoadCalculation,
                breakdown: (0, rtoCalculator_1.getRTOBreakdown)(input),
            });
        }
        res.json({
            success: true,
            input,
            rto: rtoResult,
            breakdown: (0, rtoCalculator_1.getRTOBreakdown)(input),
        });
    }
    catch (error) {
        console.error('RTO calculation error:', error);
        res.status(500).json({ error: 'RTO calculation failed' });
    }
};
exports.calculateRTOController = calculateRTOController;
/**
 * Bulk calculate RTO for multiple vehicles
 * POST /api/pricing/calculate-rto-bulk
 */
const bulkCalculateRTOController = async (req, res) => {
    try {
        const { vehicles, gstRate = 5, insurancePercentage = 3 } = req.body;
        if (!Array.isArray(vehicles) || vehicles.length === 0) {
            return res.status(400).json({ error: 'Vehicles array is required' });
        }
        const results = vehicles.map((vehicle) => {
            try {
                const input = {
                    state: vehicle.state,
                    exShowroomPrice: Number(vehicle.exShowroomPrice),
                    fuelType: vehicle.fuelType,
                    engineCapacity: vehicle.engineCapacity ? Number(vehicle.engineCapacity) : undefined,
                    vehicleType: vehicle.vehicleType,
                    vehicleAge: vehicle.vehicleAge ? Number(vehicle.vehicleAge) : 0,
                };
                const rtoResult = (0, rtoCalculator_1.calculateRTO)(input);
                const pricing = (0, rtoCalculator_1.calculateOnRoadPrice)(input.exShowroomPrice, rtoResult, gstRate, insurancePercentage);
                return {
                    success: true,
                    vehicle,
                    rtoPercentage: rtoResult.totalRTOPercentage,
                    rtoAmount: rtoResult.totalRTOAmount,
                    onRoadPrice: pricing.onRoadPrice,
                    breakdown: rtoResult,
                };
            }
            catch (error) {
                return {
                    success: false,
                    vehicle,
                    error: error instanceof Error ? error.message : 'Calculation failed',
                };
            }
        });
        res.json({
            success: true,
            total: results.length,
            successful: results.filter((r) => r.success).length,
            results,
        });
    }
    catch (error) {
        console.error('Bulk RTO calculation error:', error);
        res.status(500).json({ error: 'Bulk calculation failed' });
    }
};
exports.bulkCalculateRTOController = bulkCalculateRTOController;
/**
 * Get RTO rates for all states
 * GET /api/pricing/rto-rates
 */
const getRTORatesController = async (req, res) => {
    try {
        const stateRates = {
            'Andhra Pradesh': 9,
            'Arunachal Pradesh': 8,
            'Assam': 8,
            'Bihar': 8.5,
            'Chhattisgarh': 8,
            'Goa': 9,
            'Gujarat': 9,
            'Haryana': 9,
            'Himachal Pradesh': 8,
            'Jharkhand': 8,
            'Karnataka': 17,
            'Kerala': 9,
            'Madhya Pradesh': 8,
            'Maharashtra': 10,
            'Manipur': 8,
            'Meghalaya': 8,
            'Mizoram': 8,
            'Nagaland': 8,
            'Odisha': 8,
            'Punjab': 8,
            'Rajasthan': 9,
            'Sikkim': 8,
            'Tamil Nadu': 9,
            'Telangana': 9,
            'Tripura': 8,
            'Uttar Pradesh': 8,
            'Uttarakhand': 8,
            'West Bengal': 8,
            'Chandigarh': 9,
            'Delhi': 9,
            'Ladakh': 8,
            'Lakshadweep': 8,
            'Puducherry': 9,
            'Daman and Diu': 9,
            'Dadar and Nagar Haveli': 9,
        };
        res.json({
            success: true,
            rates: stateRates,
            notes: {
                baseRates: 'Base RTO percentage by state (before price slab adjustment)',
                priceSlabs: 'Prices determine slab: <5L (1x), 5-10L (1.2x), 10-15L (1.5x), 15-20L (1.8x), >20L (2x)',
                fuelTypes: 'Fuel type may add surcharges: Diesel +0.5%, CNG -0.5%, Hybrid -1%, EV -3% (default state)',
                greenTax: '15-20yr vehicles: +3%, >20yr vehicles: +6%',
            },
        });
    }
    catch (error) {
        console.error('Get RTO rates error:', error);
        res.status(500).json({ error: 'Failed to retrieve RTO rates' });
    }
};
exports.getRTORatesController = getRTORatesController;
