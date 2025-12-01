import { Router } from "express";
import {
  getSpecsByVariant,
  createSpecs,
  bulkCreateSpecs,
  updateSpecs,
  deleteSpecs,
  listSpecs
} from "../controllers/space/specs.controller";

import verifyAdmin from "../middleware/verifyAdmin";

const router = Router();

/**
 * Public Read Endpoints
 */
router.get("/", listSpecs);                // List with pagination
router.get("/variant/:variantId", getSpecsByVariant); // Get specs by variantId (more clear & prevents "*bulk" conflicts)
// Allow both `/specs/:variantId` and `/specs/variant/:variantId` for compatibility with frontend clients
router.get("/:variantId", getSpecsByVariant);

/**
 * Admin Protected Endpoints
 */
router.post("/", verifyAdmin, createSpecs);
router.post("/bulk", verifyAdmin, bulkCreateSpecs);
router.put("/:variantId", verifyAdmin, updateSpecs);
router.delete("/:variantId", verifyAdmin, deleteSpecs);

export default router;
