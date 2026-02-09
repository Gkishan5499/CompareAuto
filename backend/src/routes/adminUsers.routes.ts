import { Router } from "express";
import verifyAdmin, { AuthRequest } from "../middleware/verifyAdmin";
import {
  listAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../controllers/adminUsers.controller";

const router = Router();

const requireAdminRole = (req: AuthRequest, res: any, next: any) => {
  if (req.admin?.role !== "admin") {
    return res.status(403).json({ message: "Admin role required" });
  }
  return next();
};

router.get("/", verifyAdmin, requireAdminRole, listAdminUsers);
router.get("/:id", verifyAdmin, requireAdminRole, getAdminUserById);
router.post("/", verifyAdmin, requireAdminRole, createAdminUser);
router.put("/:id", verifyAdmin, requireAdminRole, updateAdminUser);
router.delete("/:id", verifyAdmin, requireAdminRole, deleteAdminUser);

export default router;
