import { Router } from "express";
import {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
} from "../controllers/siteSetting.controller";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";

const router = Router();

router.get("/", getAllSettings);
router.get("/:key", getSettingByKey);
router.put("/", verifyAdmin, requirePermission("settings"), upsertSetting);
router.delete("/:key", verifyAdmin, requirePermission("settings"), deleteSetting);

export default router;
