import { getBrands, searchCars, searchUsedCars, Brand, Model, Variant, UsedCar } from "./data";
import { formatINR, parseINRToRupees } from "./guards";

export type SearchResultType = "brand" | "model" | "variant" | "used-car";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  url: string;
  image?: string;
}

export interface SearchResponse {
  query: string;
  results: {
    brands: SearchResult[];
    models: SearchResult[];
    variants: SearchResult[];
    usedCars: SearchResult[];
  };
  totalCount: number;
}

export const performSearch = async (query: string): Promise<SearchResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    return {
      query,
      results: { brands: [], models: [], variants: [], usedCars: [] },
      totalCount: 0,
    };
  }

  // Search brands
  const brands = getBrands()
    .filter((b) => b.name.toLowerCase().includes(lowerQuery))
    .slice(0, 2)
    .map(
      (b): SearchResult => ({
        id: b.id,
        type: "brand",
        title: b.name,
        subtitle: `${b.modelCount} models`,
        url: `/${b.slug}`,
        image: b.logo,
      })
    );

  // Search cars (models & variants)
  const carResults = searchCars(query);
  const models: SearchResult[] = [];
  const variants: SearchResult[] = [];

  carResults.forEach((item: Brand | Model | Variant) => {
    // Type guard for Model: has priceRange object
    if ('priceRange' in item && item.priceRange && typeof item.priceRange === 'object') {
      const model = item as Model;
      if (models.length < 2) {
        const minPrice = model.status === "upcoming" 
          ? model.expectedPriceMin || 0 
          : model.priceRange?.min || 0;
        const maxPrice = model.status === "upcoming"
          ? model.expectedPriceMax || 0
          : model.priceRange?.max || 0;
        
        models.push({
          id: model.id,
          type: "model",
          title: `${model.brandName} ${model.name}`,
          subtitle: `${formatINR(minPrice, true)} - ${formatINR(maxPrice, true)}`,
          url: `/${model.brandName.toLowerCase().replace(/\s+/g, "-")}/${model.slug}`,
          image: model.image,
        });
      }
    }
    // Type guard for Variant: has fuelType string property
    else if ('fuelType' in item && typeof (item as any).fuelType === 'string') {
      const variant = item as Variant;
      if (variants.length < 2) {
        // Simplified variant result without full URL
        variants.push({
          id: variant.id,
          type: "variant",
          title: variant.name,
          subtitle: `${formatINR(parseINRToRupees(variant.price), true)} • ${variant.fuelType} • ${variant.transmission}`,
          url: `#variant-${variant.slug}`,
        });
      }
    }
  });

  // Search used cars
  const usedCars = searchUsedCars(query)
    .slice(0, 2)
    .map(
      (car): SearchResult => ({
        id: car.id,
        type: "used-car",
        title: car.title,
        subtitle: `${car.city} • ${formatINR(parseINRToRupees(car.price), true)}`,
        url: car.listingUrl,
        image: car.images[0],
      })
    );

  const totalCount = brands.length + models.length + variants.length + usedCars.length;

  return {
    query,
    results: { brands, models, variants, usedCars },
    totalCount,
  };
};
