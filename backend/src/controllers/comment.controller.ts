import { Request, Response } from "express";
import Comment from "../models/Comment.model";

export const createComment = async (req: Request, res: Response) => {
  try {
    const { articleId, name, email, content } = req.body;
    if (!articleId || !name || !email || !content) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }
    const doc = await Comment.create({ articleId, name, email, content, status: "pending" });
    return res.json({ success: true, comment: doc });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to create comment" });
  }
};

export const listCommentsByArticle = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    const items = await Comment.find({ articleId, status: "approved" }).sort({ createdAt: -1 });
    return res.json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch comments" });
  }
};

export const adminListComments = async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || undefined;
    const filter: any = {};
    if (status) filter.status = status;
    const items = await Comment.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch comments" });
  }
};

export const updateCommentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }
    const updated = await Comment.findByIdAndUpdate(id, { status }, { new: true });
    return res.json({ success: true, comment: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update comment" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Comment.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to delete comment" });
  }
};
