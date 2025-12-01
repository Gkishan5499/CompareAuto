import { Router } from "express";
import {
  getAllMedia,
  getMediaByKey,
  createMediaEntry,
  updateMediaEntry,
  deleteMediaEntry
} from "../controllers/mediaMap.controller";

const router = Router();

router.get("/", getAllMedia);
router.get("/:key", getMediaByKey);
router.post("/", createMediaEntry);
router.put("/:key", updateMediaEntry);
router.delete("/:key", deleteMediaEntry);

export default router;
