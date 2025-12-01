"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const carModel_controller_1 = require("../controllers/carModel.controller");
const router = (0, express_1.Router)();
// Public routes
router.get("/", carModel_controller_1.getAllCarModels);
router.get("/popular", carModel_controller_1.getPopularCarModels);
router.get("/new", carModel_controller_1.getNewCarModels);
router.get("/upcoming", carModel_controller_1.getUpcomingCarModels);
router.get("/brand/:brandId", carModel_controller_1.getCarModelsByBrand);
router.get("/body-type/:bodyType", carModel_controller_1.getCarModelsByBodyType);
router.get("/fuel-type/:fuelType", carModel_controller_1.getCarModelsByFuelType);
router.get("/slug/:slug", carModel_controller_1.getCarModelBySlug);
router.get("/:id", carModel_controller_1.getCarModelById);
router.post("/bulk", carModel_controller_1.bulkCreateCarModels);
// Admin routes
router.post("/", carModel_controller_1.createCarModel);
router.put("/:id", carModel_controller_1.updateCarModel);
router.delete("/:id", carModel_controller_1.deleteCarModel);
exports.default = router;
