"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const heroCarousel_controller_1 = require("../controllers/heroCarousel.controller");
const router = express_1.default.Router();
// Public routes
router.get("/active", heroCarousel_controller_1.getActiveHeroImages);
// Admin routes
router.get("/", heroCarousel_controller_1.getAllHeroImages);
router.get("/:id", heroCarousel_controller_1.getHeroImageById);
router.post("/", heroCarousel_controller_1.createHeroImage);
router.put("/:id", heroCarousel_controller_1.updateHeroImage);
router.delete("/:id", heroCarousel_controller_1.deleteHeroImage);
router.post("/reorder", heroCarousel_controller_1.reorderHeroImages);
exports.default = router;
