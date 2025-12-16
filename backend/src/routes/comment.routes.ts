import { Router } from "express";
import { adminListComments, createComment, deleteComment, listCommentsByArticle, updateCommentStatus } from "../controllers/comment.controller";

const router = Router();

// Public
router.get("/article/:articleId", listCommentsByArticle);
router.post("/", createComment);

// Admin
router.get("/", adminListComments);
router.put("/:id/status", updateCommentStatus);
router.delete("/:id", deleteComment);

export default router;
