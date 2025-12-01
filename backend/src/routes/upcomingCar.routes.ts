import { Router } from "express";
import {
  getAllUpcomingCars,
  getUpcomingCarById,
  createUpcomingCar,
  updateUpcomingCar,
  deleteUpcomingCar
} from "../controllers/upcomingCar.controller";

const router = Router();

router.get("/", getAllUpcomingCars);
router.get("/:id", getUpcomingCarById);
router.post("/", createUpcomingCar);
router.put("/:id", updateUpcomingCar);
router.delete("/:id", deleteUpcomingCar);

export default router;
