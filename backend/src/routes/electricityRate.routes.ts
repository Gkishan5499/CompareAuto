import { Router } from "express";
import {
  getAllElectricityRates,
  getElectricityRatesByState,
  createElectricityRate,
  updateElectricityRate,
  deleteElectricityRate
} from "../controllers/electricityRate.controller";

const router = Router();

router.get("/", getAllElectricityRates);
router.get("/:state", getElectricityRatesByState);
router.post("/", createElectricityRate);
router.put("/:id", updateElectricityRate);
router.delete("/:id", deleteElectricityRate);

export default router;
