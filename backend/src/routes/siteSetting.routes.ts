import { Router } from "express";
import {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
} from "../controllers/siteSetting.controller";

const router = Router();

router.get("/", getAllSettings);
router.get("/:key", getSettingByKey);
router.put("/", upsertSetting);
router.delete("/:key", deleteSetting);

export default router;
