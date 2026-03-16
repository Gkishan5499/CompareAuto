import { Router } from "express";
import { adminListComments, createComment, deleteComment, listCommentsByArticle, updateCommentStatus } from "../controllers/comment.controller";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";

const router = Router();

// Public
router.get("/article/:articleId", listCommentsByArticle);
router.post("/", createComment);

// Admin
router.get("/", verifyAdmin, requirePermission("comments"), adminListComments);
router.put("/:id/status", verifyAdmin, requirePermission("comments"), updateCommentStatus);
router.delete("/:id", verifyAdmin, requirePermission("comments"), deleteComment);

export default router;
