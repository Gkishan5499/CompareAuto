import { Request, Response } from "express";
import Article from "../models/Article.model";

export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articles = await Article.find().sort({ date: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
};

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const article = await Article.findOne({ id: req.params.id });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch article" });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.create(req.body);
    res.json(article);
  } catch (error) {
    res.status(400).json({ error: "Failed to create article" });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(article);
  } catch (error) {
    res.status(400).json({ error: "Failed to update article" });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    await Article.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Article deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete article" });
  }
};
