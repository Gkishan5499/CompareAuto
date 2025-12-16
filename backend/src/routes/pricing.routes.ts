import { Router } from "express";
import { getVariantPriceBreakdown, calcPriceFromValue } from "../controllers/pricing.controller";
import {
  calculateRTOController,
  bulkCalculateRTOController,
  getRTORatesController,
} from "../controllers/rtoCalculator.controller";
import { ALL_STATES, CITY_TO_STATE } from "../lib/cityStateMapping";

const router = Router();

// GET /api/pricing/cities - Get all available cities (must come before variant routes)
router.get("/cities", (req, res) => {
  res.json({ cities: Object.keys(CITY_TO_STATE).sort() });
});

// GET /api/pricing/states - Get all states (must come before variant routes)
router.get("/states", (req, res) => {
  res.json({ states: ALL_STATES.sort() });
});

// GET /api/pricing/city-state-mapping - Get complete mapping (must come before variant routes)
router.get("/city-state-mapping", (req, res) => {
  res.json({ mapping: CITY_TO_STATE });
});

// POST /api/pricing/calc  { exShowroomPrice, city?, state? }
router.post("/calc", calcPriceFromValue);

// GET /api/pricing/variant/:id/price?city=...&state=...
router.get("/variant/:id/price", getVariantPriceBreakdown);

// RTO Calculator Routes
// POST /api/pricing/calculate-rto
router.post("/calculate-rto", calculateRTOController);

// POST /api/pricing/calculate-rto-bulk
router.post("/calculate-rto-bulk", bulkCalculateRTOController);

// GET /api/pricing/rto-rates
router.get("/rto-rates", getRTORatesController);

export default router;
