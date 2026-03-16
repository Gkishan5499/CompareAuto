import { Router } from "express";
import {
  getAllDealers,
  getDealerById,
  createDealer,
  updateDealer,
  deleteDealer
} from "../controllers/dealer.controller";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";

const router = Router();

router.get("/", getAllDealers);
router.get("/:id", getDealerById);
router.post("/", verifyAdmin, requirePermission("dealers"), createDealer);
router.put("/:id", verifyAdmin, requirePermission("dealers"), updateDealer);
router.delete("/:id", verifyAdmin, requirePermission("dealers"), deleteDealer);

export default router;
