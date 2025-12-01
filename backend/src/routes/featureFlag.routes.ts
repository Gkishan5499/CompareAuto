import { Router } from "express";
import {
  getFeatureFlags,
  updateFeatureFlags
} from "../controllers/featureFlag.controller";

const router = Router();

router.get("/", getFeatureFlags);
router.put("/", updateFeatureFlags);

export default router;
