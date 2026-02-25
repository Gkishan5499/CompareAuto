"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyAdmin_1 = __importDefault(require("../middleware/verifyAdmin"));
const adminUsers_controller_1 = require("../controllers/adminUsers.controller");
const router = (0, express_1.Router)();
const requireAdminRole = (req, res, next) => {
    var _a;
    if (((_a = req.admin) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
        return res.status(403).json({ message: "Admin role required" });
    }
    return next();
};
router.get("/", verifyAdmin_1.default, requireAdminRole, adminUsers_controller_1.listAdminUsers);
router.get("/:id", verifyAdmin_1.default, requireAdminRole, adminUsers_controller_1.getAdminUserById);
router.post("/", verifyAdmin_1.default, requireAdminRole, adminUsers_controller_1.createAdminUser);
router.put("/:id", verifyAdmin_1.default, requireAdminRole, adminUsers_controller_1.updateAdminUser);
router.delete("/:id", verifyAdmin_1.default, requireAdminRole, adminUsers_controller_1.deleteAdminUser);
exports.default = router;
