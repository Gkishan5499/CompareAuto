import { Model } from "./data";

/**
 * Safe getters for model data to prevent undefined errors
 * Essential for handling large datasets with incomplete data
 */

export function getModelPrice(model: Model): number {
  if (model.status === "upcoming") {
    return model.expectedPriceMin || 0;
  }
  return model.priceRange?.min || 0;
}

export function getModelMaxPrice(model: Model): number {
  if (model.status === "upcoming") {
    return model.expectedPriceMax || 0;
  }
  return model.priceRange?.max || 0;
}

export function formatPrice(price: number): string {
  return `₹${(price / 100000).toFixed(2)}L`;
}

export function getModelRating(model: Model): string {
  return model.rating ? `${model.rating}/5` : "N/A";
}

export function getModelReviews(model: Model): string {
  return model.reviews ? model.reviews.toLocaleString() : "0";
}

export function getModelReviewsNumber(model: Model): number {
  return model.reviews || 0;
}

export function getVariantCount(model: Model): number {
  return model.variantCount || 0;
}

/**
 * Validate model data completeness
 */
export function isModelComplete(model: Model): boolean {
  return !!(
    model.id &&
    model.name &&
    model.brandName &&
    (model.priceRange?.min || model.expectedPriceMin) &&
    model.bodyType
  );
}

/**
 * Get safe display data for a model
 */
export function getModelDisplayData(model: Model) {
  return {
    price: getModelPrice(model),
    maxPrice: getModelMaxPrice(model),
    formattedPrice: formatPrice(getModelPrice(model)),
    formattedMaxPrice: formatPrice(getModelMaxPrice(model)),
    rating: getModelRating(model),
    reviews: getModelReviews(model),
    variantCount: getVariantCount(model),
    isComplete: isModelComplete(model),
  };
}
