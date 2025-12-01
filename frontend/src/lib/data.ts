import { dataCache } from "./data-cache";
import type {
  Brand,
  Model,
  Variant,
  Comparison,
  Article,
  UsedCar,
  ExpertReview,
  OwnerReview,
} from "./data-cache";

// Re-export types from data-cache
export type {
  Brand,
  Model,
  Variant,
  Comparison,
  Article,
  UsedCar,
  ExpertReview,
  OwnerReview,
} from "./data-cache";

// Brands
export const getBrands = (): Brand[] => {
  return dataCache.getBrands();
};

export const getBrandBySlug = (slug: string): Brand | undefined => {
  return dataCache.getBrands().find((brand) => brand.slug === slug);
};

// Models
export const getModels = (): Model[] => {
  return dataCache.getModels();
};

export const getModelsByBrand = (brandSlug: string): Model[] => {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return [];
  return dataCache.getModels().filter((model) => model.brandId === brand.id);
};

export const getModel = (brandSlug: string, modelSlug: string): Model | undefined => {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return undefined;
  return dataCache.getModels().find(
    (model) => model.brandId === brand.id && model.slug === modelSlug
  );
};

// Variants
export const getVariants = (modelId: string): Variant[] => {
  return dataCache.getVariants().filter((variant) => variant.modelId === modelId);
};

export const getVariant = (
  brandSlug: string,
  modelSlug: string,
  variantSlug: string
): Variant | undefined => {
  const model = getModel(brandSlug, modelSlug);
  if (!model) return undefined;
  return dataCache.getVariants().find(
    (variant) => variant.modelId === model.id && variant.slug === variantSlug
  );
};

// Search
export const searchCars = (query: string): (Brand | Model | Variant)[] => {
  const lowerQuery = query.toLowerCase();
  const results: (Brand | Model | Variant)[] = [];

  // Search brands
  dataCache.getBrands().forEach((brand) => {
    if (brand.name.toLowerCase().includes(lowerQuery)) {
      results.push(brand);
    }
  });

  // Search models
  dataCache.getModels().forEach((model) => {
    if (model.name.toLowerCase().includes(lowerQuery)) {
      results.push(model);
    }
  });

  // Search variants
  dataCache.getVariants().forEach((variant) => {
    if (variant.name.toLowerCase().includes(lowerQuery)) {
      results.push(variant);
    }
  });

  return results.slice(0, 10); // Limit to 10 results
};

// Comparisons
export const getTrendingComparisons = (): Comparison[] => {
  return dataCache.getComparisons().sort((a, b) => b.views - a.views).slice(0, 6);
};

export const getFeaturedModels = (): Model[] => {
  return dataCache.getModels().slice(0, 8);
};

// Articles
export const getArticles = (): Article[] => {
  return dataCache.getArticles();
};

export const getArticleBySlug = (slug: string): Article | undefined => {
  return dataCache.getArticles().find((article) => article.slug === slug);
};

export const getArticlesByCategory = (category: string): Article[] => {
  if (category === "All") return dataCache.getArticles();
  return dataCache.getArticles().filter((article) => article.category === category);
};

export const searchArticles = (query: string): Article[] => {
  const lowerQuery = query.toLowerCase();
  return dataCache.getArticles().filter(
    (article) =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.excerpt.toLowerCase().includes(lowerQuery) ||
      article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getRelatedArticles = (articleId: string, relatedIds: string[]): Article[] => {
  return dataCache.getArticles().filter(
    (article) => relatedIds.includes(article.id) && article.id !== articleId
  );
};

// Used Cars
export const getUsedCars = (params?: { city?: string }): UsedCar[] => {
  let cars = dataCache.getUsedCars();
  if (params?.city) {
    cars = cars.filter((car) => car.city.toLowerCase() === params.city?.toLowerCase());
  }
  return cars;
};

export const getUsedCar = (id: string): UsedCar | undefined => {
  return dataCache.getUsedCars().find((car) => car.id === id);
};

export const getUsedCities = (): string[] => {
  const cities = dataCache.getUsedCars().map((car) => car.city);
  return Array.from(new Set(cities)).sort();
};

export const searchUsedCars = (
  query: string,
  filters?: { city?: string; priceMax?: number }
): UsedCar[] => {
  const lowerQuery = query.toLowerCase();
  let results = dataCache.getUsedCars().filter(
    (car) =>
      car.title.toLowerCase().includes(lowerQuery) ||
      car.brand.toLowerCase().includes(lowerQuery) ||
      car.model.toLowerCase().includes(lowerQuery)
  );

  if (filters?.city) {
    results = results.filter((car) => car.city.toLowerCase() === filters.city?.toLowerCase());
  }
  if (filters?.priceMax) {
    results = results.filter((car) => car.price <= filters.priceMax!);
  }

  return results;
};

// Reviews
export const getExpertReview = (brandSlug: string, modelSlug: string): ExpertReview | undefined => {
  return dataCache.getReviews().find(
    (review) => review.type === "expert" && review.brandSlug === brandSlug && review.modelSlug === modelSlug
  ) as ExpertReview | undefined;
};

export const getOwnerReviews = (brandSlug: string, modelSlug: string): OwnerReview[] => {
  return dataCache.getReviews().filter(
    (review) => review.type === "owner" && review.brandSlug === brandSlug && review.modelSlug === modelSlug
  ) as OwnerReview[];
};

// Fuel Type Helpers
export const getFuelTypes = (): string[] => {
  return ["EV", "Hybrid", "CNG", "Petrol", "Diesel"];
};

export const getModelsByFuel = (fuelType: string): Model[] => {
  return dataCache.getModels().filter((model) => {
    const variants = getVariants(model.id);
    return variants.some((v) => v.fuelType === fuelType);
  });
};

export const countModelsByFuel = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  getFuelTypes().forEach((fuel) => {
    counts[fuel] = getModelsByFuel(fuel).length;
  });
  return counts;
};

// New & Upcoming Cars
export const getNewModels = (): Model[] => {
  const today = new Date();
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  return dataCache.getModels().filter((model) => {
    if (model.status === "on_sale" && (model as any).launchedAt) {
      const launchDate = new Date((model as any).launchedAt);
      return launchDate >= sixtyDaysAgo && launchDate <= today;
    }
    return false;
  });
};

export const getUpcomingModels = (): Model[] => {
  return dataCache.getModels().filter((model) => model.status === "upcoming");
};

export const getNewByBrand = (brandSlug: string): Model[] => {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return [];
  return getNewModels().filter((model) => model.brandId === brand.id);
};

export const getUpcomingByBrand = (brandSlug: string): Model[] => {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return [];
  return getUpcomingModels().filter((model) => model.brandId === brand.id);
};

export const getAllModels = (): Model[] => {
  return dataCache.getModels();
};

// Body Type Helpers
export const getBodyTypes = (): string[] => {
  // Extract unique body types from actual model data
  const bodyTypes = new Set<string>();
  dataCache.getModels().forEach((model) => {
    if (model.bodyType) {
      bodyTypes.add(model.bodyType);
    }
  });
  return Array.from(bodyTypes).sort();
};

export const getModelsByBody = (bodyType: string): Model[] => {
  return dataCache.getModels().filter((model) => {
    // Exact match on bodyType
    return model.bodyType === bodyType;
  });
};

export const getModelMinPrice = (model: Model): number | null => {
  // For upcoming models, use expected price
  if (model.status === "upcoming" && model.expectedPriceMin) {
    return model.expectedPriceMin;
  }
  
  // For on-sale models, use priceRange or calculate from variants
  if (model.priceRange?.min) {
    return model.priceRange.min;
  }
  
  // Fallback: calculate from variants
  const variants = getVariants(model.id);
  if (variants.length === 0) return null;
  
  const prices = variants.map(v => v.price).filter(p => p > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
};

export const sortByMinPriceAsc = (models: Model[]): Model[] => {
  return [...models].sort((a, b) => {
    const priceA = getModelMinPrice(a);
    const priceB = getModelMinPrice(b);
    
    // Push nulls to the end
    if (priceA === null && priceB === null) return 0;
    if (priceA === null) return 1;
    if (priceB === null) return -1;
    
    return priceA - priceB;
  });
};

export const countModelsByBody = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  getBodyTypes().forEach((bodyType) => {
    counts[bodyType] = getModelsByBody(bodyType).length;
  });
  return counts;
};
