"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const router = (0, express_1.Router)();
// Public
router.get("/article/:articleId", comment_controller_1.listCommentsByArticle);
router.post("/", comment_controller_1.createComment);
// Admin
router.get("/", comment_controller_1.adminListComments);
router.put("/:id/status", comment_controller_1.updateCommentStatus);
router.delete("/:id", comment_controller_1.deleteComment);
exports.default = router;
