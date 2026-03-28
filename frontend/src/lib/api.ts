/**
 * API Service
 * Centralized API client for backend communication
 */

import { dataCache } from "./data-cache";
import { parseINRToRupees } from "./guards";
import { CITY_TO_STATE } from "./cityStateMapping";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `API Error: ${response.statusText}`
    );
  }

  return response.json();
}

// Brands API
export const brandsApi = {
  getAll: (vehicleCategory?: "car" | "bike") => {
    const params = vehicleCategory ? `?vehicleCategory=${vehicleCategory}` : "";
    return fetchApi<any[]>(`/brands${params}`);
  },
  getById: (id: string) => fetchApi<any>(`/brands/${id}`),
  getBySlug: (slug: string) => fetchApi<any>(`/brands/slug/${slug}`),
};

// Models API
export const modelsApi = {
  getAll: (vehicleCategory?: "car" | "bike") => {
    const params = vehicleCategory ? `?vehicleCategory=${vehicleCategory}` : "";
    return fetchApi<any[]>(`/models${params}`);
  },
  getById: (id: string) => fetchApi<any>(`/models/${id}`),
  getBySlug: (slug: string) => fetchApi<any>(`/models/slug/${slug}`),
  getByBrand: (brandId: string) => fetchApi<any[]>(`/models/brand/${brandId}`),
  getByBrandSlug: async (brandSlug: string) => {
    const brand = await brandsApi.getBySlug(brandSlug);
    if (!brand) return [];

    const directModels = await modelsApi.getByBrand(brand.id);
    if (Array.isArray(directModels) && directModels.length > 0) return directModels;

    // Fallback for legacy/inconsistent brand links in old data.
    const allModels = await modelsApi.getAll();
    const normalizedBrandSlug = String(brandSlug || "").trim().toLowerCase().replace(/^bike-/, "");
    const normalizedBrandName = String(brand.name || "").trim().toLowerCase();
    const normalizedBrandId = String(brand.id || "").trim().toLowerCase().replace(/^bike-/, "");

    return allModels.filter((model: any) => {
      const modelBrandId = String(model?.brandId || "").trim().toLowerCase().replace(/^bike-/, "");
      const modelBrandName = String(model?.brandName || "").trim().toLowerCase();
      const modelBrandSlug = String(model?.brandSlug || "").trim().toLowerCase().replace(/^bike-/, "");

      return (
        (modelBrandId && modelBrandId === normalizedBrandId) ||
        (modelBrandId && modelBrandId === normalizedBrandSlug) ||
        (modelBrandSlug && modelBrandSlug === normalizedBrandSlug) ||
        (modelBrandName && modelBrandName === normalizedBrandName)
      );
    });
  },
  getByBodyType: (bodyType: string) => fetchApi<any[]>(`/models/body-type/${bodyType}`),
  getByFuelType: (fuelType: string) => fetchApi<any[]>(`/models/fuel-type/${fuelType}`),
  getPopular: (limit?: number, vehicleCategory?: "car" | "bike") => {
    const query = new URLSearchParams();
    if (limit) query.set("limit", String(limit));
    if (vehicleCategory) query.set("vehicleCategory", vehicleCategory);
    const params = query.toString() ? `?${query.toString()}` : "";
    return fetchApi<any[]>(`/models/popular${params}`);
  },
  getNew: (limit?: number, vehicleCategory?: "car" | "bike") => {
    const query = new URLSearchParams();
    if (limit) query.set("limit", String(limit));
    if (vehicleCategory) query.set("vehicleCategory", vehicleCategory);
    const params = query.toString() ? `?${query.toString()}` : "";
    return fetchApi<any[]>(`/models/new${params}`);
  },
  getUpcoming: (limit?: number, vehicleCategory?: "car" | "bike") => {
    const query = new URLSearchParams();
    if (limit) query.set("limit", String(limit));
    if (vehicleCategory) query.set("vehicleCategory", vehicleCategory);
    const params = query.toString() ? `?${query.toString()}` : "";
    return fetchApi<any[]>(`/models/upcoming${params}`);
  },
};

// Variants API
export const variantsApi = {
  getAll: (vehicleCategory?: "car" | "bike") => {
    const params = vehicleCategory ? `?vehicleCategory=${vehicleCategory}` : "";
    return fetchApi<any[]>(`/variants${params}`);
  },
  getById: (id: string) => fetchApi<any>(`/variants/${id}`),
  getByModel: (modelId: string) => fetchApi<any[]>(`/variants/model/${modelId}`),
};

// Specs API
export const specsApi = {
  getByVariant: async (variantId: string) => {
    const result = await fetchApi<any>(`/specs/${variantId}`);
    // Handle both { data: {...} } and {...} response formats
    return result?.data || result;
  },
  getByVariantId: async (variantId: string) => {
    const result = await fetchApi<any>(`/specs/${variantId}`);
    // Handle both { data: {...} } and {...} response formats
    return result?.data || result;
  },
  list: (page?: number, limit?: number) => fetchApi<any>(`/specs?page=${page || 1}&limit=${limit || 50}`),
};

// Articles API
export const articlesApi = {
  getAll: () => fetchApi<any[]>("/articles"),
  getById: (id: string) => fetchApi<any>(`/articles/${id}`),
  getBySlug: async (slug: string) => {
    const articles = await fetchApi<any[]>("/articles");
    return articles.find((a: any) => a.slug === slug);
  },
};

// Comments API
export const commentsApi = {
  listByArticle: (articleId: string) => fetchApi<any>(`/comments/article/${articleId}`),
  create: (payload: { articleId: string; name: string; email: string; content: string }) =>
    fetchApi<any>(`/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// Comparisons API
export const comparisonsApi = {
  getAll: () => fetchApi<any[]>("/comparisons"),
  getById: (id: string) => fetchApi<any>(`/comparisons/${id}`),
};

// Dealers API
export const dealersApi = {
  getAll: () => fetchApi<any[]>("/dealers"),
  getById: (id: string) => fetchApi<any>(`/dealers/${id}`),
};

// Fuel Prices API
export const fuelPricesApi = {
  getAll: () => fetchApi<any[]>("/fuel-prices"),
  getByCity: (city: string) => fetchApi<any>(`/fuel-prices/${city}`),
};

// Electricity Rates API
export const electricityRatesApi = {
  getAll: () => fetchApi<any[]>("/electricity-rates"),
  getByState: (state: string) => fetchApi<any[]>(`/electricity-rates/${state}`),
};

// Reviews API
export const reviewsApi = {
  getAll: () => fetchApi<any[]>("/reviews"),
  getById: (id: string) => fetchApi<any>(`/reviews/${id}`),
  getByModel: (modelSlug: string) => fetchApi<any[]>(`/reviews/model/${modelSlug}`),
};

// Used Cars API
export const usedCarsApi = {
  getAll: () => fetchApi<any[]>("/used-cars"),
  getById: (id: string) => fetchApi<any>(`/used-cars/${id}`),
  getByCity: (city: string) => fetchApi<any[]>(`/used-cars/city/${city}`),
};

// Upcoming Cars API
export const upcomingCarsApi = {
  getAll: () => fetchApi<any[]>("/upcoming-cars"),
  getById: (id: string) => fetchApi<any>(`/upcoming-cars/${id}`),
};

// Feature Flags API
export const featureFlagsApi = {
  get: () => fetchApi<any>("/feature-flags"),
  update: (flags: any) => fetchApi<any>("/feature-flags", {
    method: "PUT",
    body: JSON.stringify(flags),
  }),
};

// Cities API
export const citiesApi = {
  getAll: () => fetchApi<any[]>("/cities"),
  getPopular: () => fetchApi<any[]>("/cities/popular"),
  getBySlug: (slug: string) => fetchApi<any>(`/cities/${slug}`),
  search: (query: string) => fetchApi<any[]>(`/cities/search/${encodeURIComponent(query)}`),
};

// Search API
export const searchApi = {
  searchCars: (params: {
    q?: string;
    brand?: string;
    bodyType?: string;
    fuelType?: string;
    priceMin?: number;
    priceMax?: number;
    city?: string;
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
    return fetchApi<any>(`/search/cars?${queryParams.toString()}`);
  },
  getSuggestions: (query: string) => {
    return fetchApi<any[]>(`/search/suggestions?q=${encodeURIComponent(query)}`);
  },
  getPopular: () => fetchApi<any[]>("/search/popular"),
};

// Filter API
export const filterApi = {
  getOptions: () => fetchApi<any>("/filters/options"),
  filterCars: (filters: {
    bodyType?: string;
    fuelType?: string;
    transmission?: string;
    priceMin?: number;
    priceMax?: number;
    seating?: string;
    brand?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) => {
    return fetchApi<any>("/filters/cars", {
      method: "POST",
      body: JSON.stringify(filters),
    });
  },
};

// Popular API
export const popularApi = {
  getMostSearched: (bodyType?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (bodyType) params.append("bodyType", bodyType);
    if (limit) params.append("limit", String(limit));
    return fetchApi<any[]>(`/popular/most-searched?${params.toString()}`);
  },
  getPopularBrands: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : "";
    return fetchApi<any[]>(`/popular/brands${params}`);
  },
  getTrendingComparisons: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : "";
    return fetchApi<any[]>(`/popular/comparisons${params}`);
  },
  getLatestLaunches: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : "";
    return fetchApi<any[]>(`/popular/latest-launches${params}`);
  },
  getElectricCars: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : "";
    return fetchApi<any[]>(`/popular/electric-cars${params}`);
  },
};

// EMI Calculator (client-side calculation)
export const calculateEMI = async (
  loanAmount: number,
  interestRate: number,
  tenure: number
): Promise<{
  monthlyEmi: number;
  totalInterest: number;
  totalAmount: number;
}> => {
  // Convert annual interest rate to monthly rate (in decimal)
  const monthlyRate = interestRate / 12 / 100;
  
  // Calculate EMI using the formula: EMI = [P × R × (1 + R)^N] / [(1 + R)^N - 1]
  // Where P = Principal, R = Monthly interest rate, N = Number of months
  const emi =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1);
  
  const totalAmount = emi * tenure;
  const totalInterest = totalAmount - loanAmount;
  
  return {
    monthlyEmi: emi,
    totalInterest: totalInterest,
    totalAmount: totalAmount,
  };
};

// On-road price calculation interface
export interface PriceBreakdown {
  exShowroomPrice: number;
  rto: number;
  insurance: number;
  tcs?: number;
  fastag?: number;
  otherCharges?: number;
  onRoadPrice: number;
  // Legacy aliases for compatibility
  exShowroom?: number;
  others?: number;
  onRoad?: number;
  onRoadTotal?: number;
}

// Get on-road price breakup for a variant in a city
export const getOnRoadPrice = async (
  variantId: string,
  city: string
): Promise<PriceBreakdown> => {
  const state = CITY_TO_STATE[city] || city;
  const timestamp = new Date().getTime();
  const resp = await fetch(`/api/pricing/variant/${variantId}/price?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&_t=${timestamp}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  if (!resp.ok) {
    throw new ApiError(resp.status, `API Error: ${resp.statusText}`);
  }
  const json = await resp.json();
  const breakdown = json.breakdown as PriceBreakdown;
  
  // Add legacy aliases for backward compatibility
  breakdown.exShowroom = breakdown.exShowroom ?? breakdown.exShowroomPrice;
  breakdown.others = breakdown.others ?? breakdown.otherCharges ?? 0;
  breakdown.onRoad = breakdown.onRoad ?? breakdown.onRoadPrice;
  breakdown.onRoadTotal = breakdown.onRoadTotal ?? breakdown.onRoadPrice;
  
  return breakdown;
};

export { ApiError };
