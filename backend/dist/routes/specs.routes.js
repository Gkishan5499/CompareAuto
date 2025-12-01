"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const specs_controller_1 = require("../controllers/space/specs.controller");
const verifyAdmin_1 = __importDefault(require("../middleware/verifyAdmin"));
const router = (0, express_1.Router)();
/**
 * Public Read Endpoints
 */
router.get("/", specs_controller_1.listSpecs); // List with pagination
router.get("/variant/:variantId", specs_controller_1.getSpecsByVariant); // Get specs by variantId (more clear & prevents "*bulk" conflicts)
// Allow both `/specs/:variantId` and `/specs/variant/:variantId` for compatibility with frontend clients
router.get("/:variantId", specs_controller_1.getSpecsByVariant);
/**
 * Admin Protected Endpoints
 */
router.post("/", verifyAdmin_1.default, specs_controller_1.createSpecs);
router.post("/bulk", verifyAdmin_1.default, specs_controller_1.bulkCreateSpecs);
router.put("/:variantId", verifyAdmin_1.default, specs_controller_1.updateSpecs);
router.delete("/:variantId", verifyAdmin_1.default, specs_controller_1.deleteSpecs);
exports.default = router;
