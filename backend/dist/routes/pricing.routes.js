"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pricing_controller_1 = require("../controllers/pricing.controller");
const rtoCalculator_controller_1 = require("../controllers/rtoCalculator.controller");
const cityStateMapping_1 = require("../lib/cityStateMapping");
const router = (0, express_1.Router)();
// GET /api/pricing/cities - Get all available cities (must come before variant routes)
router.get("/cities", (req, res) => {
    res.json({ cities: Object.keys(cityStateMapping_1.CITY_TO_STATE).sort() });
});
// GET /api/pricing/states - Get all states (must come before variant routes)
router.get("/states", (req, res) => {
    res.json({ states: cityStateMapping_1.ALL_STATES.sort() });
});
// GET /api/pricing/city-state-mapping - Get complete mapping (must come before variant routes)
router.get("/city-state-mapping", (req, res) => {
    res.json({ mapping: cityStateMapping_1.CITY_TO_STATE });
});
// POST /api/pricing/calc  { exShowroomPrice, city?, state? }
router.post("/calc", pricing_controller_1.calcPriceFromValue);
// GET /api/pricing/variant/:id/price?city=...&state=...
router.get("/variant/:id/price", pricing_controller_1.getVariantPriceBreakdown);
// RTO Calculator Routes
// POST /api/pricing/calculate-rto
router.post("/calculate-rto", rtoCalculator_controller_1.calculateRTOController);
// POST /api/pricing/calculate-rto-bulk
router.post("/calculate-rto-bulk", rtoCalculator_controller_1.bulkCalculateRTOController);
// GET /api/pricing/rto-rates
router.get("/rto-rates", rtoCalculator_controller_1.getRTORatesController);
exports.default = router;
