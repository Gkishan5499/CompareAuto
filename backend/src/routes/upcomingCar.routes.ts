import { Router } from "express";
import multer from "multer";
import {
  getAllUpcomingCars,
  getUpcomingCarById,
  createUpcomingCar,
  updateUpcomingCar,
  deleteUpcomingCar,
  uploadUpcomingCarsCsv
} from "../controllers/upcomingCar.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getAllUpcomingCars);
router.get("/:id", getUpcomingCarById);
router.post("/", createUpcomingCar);
router.put("/:id", updateUpcomingCar);
router.delete("/:id", deleteUpcomingCar);
router.post("/upload-csv", upload.single("file"), uploadUpcomingCarsCsv);

export default router;
