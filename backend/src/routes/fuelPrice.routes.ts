import { Router } from "express";
import {
  getAllFuelPrices,
  getFuelPriceByCity,
  createFuelPrice,
  updateFuelPrice,
  deleteFuelPrice
} from "../controllers/fuelPrice.controller";

const router = Router();

router.get("/", getAllFuelPrices);
router.get("/:city", getFuelPriceByCity);
router.post("/", createFuelPrice);
router.put("/:city", updateFuelPrice);
router.delete("/:city", deleteFuelPrice);

export default router;
