import { Request, Response } from "express";
import Review from "../models/Review.model";

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find().sort({ reviewedAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const review = await Review.findOne({ id: req.params.id });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch review" });
  }
};

export const getReviewsByModel = async (req: Request, res: Response) => {
  try {
    const { modelSlug } = req.params;
    const reviews = await Review.find({ modelSlug });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.create(req.body);
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: "Failed to create review" });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: "Failed to update review" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    await Review.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete review" });
  }
};
