import { Router } from "express";
import multer from "multer";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";
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
router.post("/", verifyAdmin, requirePermission("upcomingCars"), createUpcomingCar);
router.put("/:id", verifyAdmin, requirePermission("upcomingCars"), updateUpcomingCar);
router.delete("/:id", verifyAdmin, requirePermission("upcomingCars"), deleteUpcomingCar);
router.post("/upload-csv", verifyAdmin, requirePermission("upcomingCars"), upload.single("file"), uploadUpcomingCarsCsv);

export default router;
