import { NextFunction, Response } from "express";
import { AuthRequest } from "./verifyAdmin";
import { AdminPermission, DEFAULT_EDITOR_PERMISSIONS } from "../constants/adminPermissions";

export default function requirePermission(permission: AdminPermission) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const admin = req.admin;

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (admin.role === "admin") {
      return next();
    }

    const permissions = Array.isArray(admin.permissions) && admin.permissions.length > 0
      ? admin.permissions
      : DEFAULT_EDITOR_PERMISSIONS;

    if (!permissions.includes(permission)) {
      return res.status(403).json({ message: "You do not have access to this module" });
    }

    return next();
  };
}
