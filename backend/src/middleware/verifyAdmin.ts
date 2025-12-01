import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export interface AuthRequest extends Request {
  admin?: any;
}

export default function verifyAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Authorization header missing" });
    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token missing" });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.admin = payload;
    return next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}
