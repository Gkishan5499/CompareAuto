import { Router } from "express";
import {
  getAllDealers,
  getDealerById,
  createDealer,
  updateDealer,
  deleteDealer
} from "../controllers/dealer.controller";

const router = Router();

router.get("/", getAllDealers);
router.get("/:id", getDealerById);
router.post("/", createDealer);
router.put("/:id", updateDealer);
router.delete("/:id", deleteDealer);

export default router;
