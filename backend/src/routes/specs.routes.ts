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
import requirePermission from "../middleware/requirePermission";

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
router.post("/", verifyAdmin, requirePermission("specs"), createSpecs);
router.post("/bulk", verifyAdmin, requirePermission("specs"), bulkCreateSpecs);
router.put("/:variantId", verifyAdmin, requirePermission("specs"), updateSpecs);
router.delete("/:variantId", verifyAdmin, requirePermission("specs"), deleteSpecs);

export default router;
