"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const featureFlag_controller_1 = require("../controllers/featureFlag.controller");
const router = (0, express_1.Router)();
router.get("/", featureFlag_controller_1.getFeatureFlags);
router.put("/", featureFlag_controller_1.updateFeatureFlags);
exports.default = router;
