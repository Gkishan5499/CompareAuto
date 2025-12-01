/**
 * Global Data Cache
 * Stores API data for synchronous access
 */

export interface Brand {
  id: string;
  name: string;
  logo: string;
  country: string;
  modelCount: number;
  slug: string;
}

export interface Model {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  slug: string;
  image: string;
  bodyType: string;
  fuelTypes?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  variantCount: number;
  rating: number;
  reviews: number;
  status?: "on_sale" | "upcoming";
  launchedAt?: string;
  expectedLaunch?: string;
  launchWindow?: string;
  expectedPriceMin?: number;
  expectedPriceMax?: number;
  keyFeatures?: string[];
  media?: {
    hero: string;
    gallery: string[];
    videoUrl?: string;
    spin360Url?: string;
    spinFrames?: string[];
  };
}

export interface Variant {
  id: string;
  modelId: string;
  name: string;
  slug: string;
  price: number;
  fuelType: string;
  transmission: string;
  engine: string;
  mileage: number;
  seating: number;
  colors: string[];
  media?: {
    hero: string;
    gallery: string[];
    videoUrl?: string;
    spin360Url?: string;
    spinFrames?: string[];
  };
}

export interface Comparison {
  id: string;
  name: string;
  models: string[];
  views: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  author: string;
  heroImage: string;
  excerpt: string;
  body: string;
  relatedIds: string[];
  readingTime: number;
}

export interface UsedCar {
  id: string;
  title: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  fuel: string;
  transmission: string;
  kms: number;
  owners: number;
  city: string;
  price: number;
  images: string[];
  features: string[];
  sellerType: string;
  sellerName: string;
  sellerPhone: string;
  listingUrl: string;
  verified: boolean;
}

export interface ExpertReview {
  id: string;
  type: "expert";
  brandSlug: string;
  modelSlug: string;
  score: number;
  summary: string;
  highlights: string[];
  fullReviewSlug?: string;
  reviewedAt: string;
}

export interface OwnerReview {
  id: string;
  type: "owner";
  brandSlug: string;
  modelSlug: string;
  rating: number;
  title: string;
  review: string;
  pros: string[];
  cons: string[];
  ownerName: string;
  ownedSince: string;
  kmsDriven: number;
  variant: string;
  city: string;
  postedAt: string;
}

// Global cache
class DataCache {
  private brands: Brand[] = [];
  private models: Model[] = [];
  private variants: Variant[] = [];
  private articles: Article[] = [];
  private comparisons: Comparison[] = [];
  private usedCars: UsedCar[] = [];
  private reviews: (ExpertReview | OwnerReview)[] = [];
  private initialized = false;

  setBrands(data: Brand[]) {
    this.brands = data;
  }

  setModels(data: Model[]) {
    this.models = data;
  }

  setVariants(data: Variant[]) {
    this.variants = data;
  }

  setArticles(data: Article[]) {
    this.articles = data;
  }

  setComparisons(data: Comparison[]) {
    this.comparisons = data;
  }

  setUsedCars(data: UsedCar[]) {
    this.usedCars = data;
  }

  setReviews(data: (ExpertReview | OwnerReview)[]) {
    this.reviews = data;
  }

  getBrands(): Brand[] {
    return this.brands;
  }

  getModels(): Model[] {
    return this.models;
  }

  getVariants(): Variant[] {
    return this.variants;
  }

  getArticles(): Article[] {
    return this.articles;
  }

  getComparisons(): Comparison[] {
    return this.comparisons;
  }

  getUsedCars(): UsedCar[] {
    return this.usedCars;
  }

  getReviews(): (ExpertReview | OwnerReview)[] {
    return this.reviews;
  }

  setInitialized(value: boolean) {
    this.initialized = value;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const dataCache = new DataCache();

