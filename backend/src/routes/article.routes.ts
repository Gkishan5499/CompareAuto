import { Router } from "express";
import {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
} from "../controllers/article.controller";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";

const router = Router();

router.get("/", getAllArticles);
router.get("/:id", getArticleById);
router.post("/", verifyAdmin, requirePermission("articles"), createArticle);
router.put("/:id", verifyAdmin, requirePermission("articles"), updateArticle);
router.delete("/:id", verifyAdmin, requirePermission("articles"), deleteArticle);

export default router;
