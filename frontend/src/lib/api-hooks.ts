/**
 * React Query hooks for API data fetching
 */
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  brandsApi,
  modelsApi,
  variantsApi,
  articlesApi,
  comparisonsApi,
  dealersApi,
  fuelPricesApi,
  electricityRatesApi,
  reviewsApi,
  usedCarsApi,
  upcomingCarsApi,
  featureFlagsApi,
  citiesApi,
  searchApi,
  filterApi,
  popularApi,
} from "./api";

// Brands
export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => brandsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBrandBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["brands", slug],
    queryFn: () => brandsApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Models
export const useModels = () => {
  return useQuery({
    queryKey: ["models"],
    queryFn: () => modelsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useModelsByBrand = (brandSlug: string) => {
  return useQuery({
    queryKey: ["models", "brand", brandSlug],
    queryFn: () => modelsApi.getByBrandSlug(brandSlug),
    enabled: !!brandSlug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useModel = (brandSlug: string, modelSlug: string) => {
  return useQuery({
    queryKey: ["models", brandSlug, modelSlug],
    queryFn: async () => {
      const brand = await brandsApi.getBySlug(brandSlug);
      if (!brand) return undefined;
      const models = await modelsApi.getByBrand(brand.id);
      return models.find((m: any) => m.slug === modelSlug);
    },
    enabled: !!brandSlug && !!modelSlug,
    staleTime: 5 * 60 * 1000,
  });
};

// Variants
export const useVariants = (modelId: string) => {
  return useQuery({
    queryKey: ["variants", modelId],
    queryFn: () => {
      if (!modelId) {
        // Return all variants if no modelId provided
        return variantsApi.getAll();
      }
      return variantsApi.getByModel(modelId);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useVariant = (brandSlug: string, modelSlug: string, variantSlug: string) => {
  return useQuery({
    queryKey: ["variants", brandSlug, modelSlug, variantSlug],
    queryFn: async () => {
      const brand = await brandsApi.getBySlug(brandSlug);
      if (!brand) return undefined;
      const models = await modelsApi.getByBrand(brand.id);
      const model = models.find((m: any) => m.slug === modelSlug);
      if (!model) return undefined;
      const variants = await variantsApi.getByModel(model.id);
      return variants.find((v: any) => v.slug === variantSlug);
    },
    enabled: !!brandSlug && !!modelSlug && !!variantSlug,
    staleTime: 5 * 60 * 1000,
  });
};

// Articles
export const useArticles = () => {
  return useQuery({
    queryKey: ["articles"],
    queryFn: () => articlesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useArticleBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["articles", slug],
    queryFn: () => articlesApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Comparisons
export const useComparisons = () => {
  return useQuery({
    queryKey: ["comparisons"],
    queryFn: () => comparisonsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

// Dealers
export const useDealers = () => {
  return useQuery({
    queryKey: ["dealers"],
    queryFn: () => dealersApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDealer = (id: string) => {
  return useQuery({
    queryKey: ["dealers", id],
    queryFn: () => dealersApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Fuel Prices
export const useFuelPrices = () => {
  return useQuery({
    queryKey: ["fuel-prices"],
    queryFn: () => fuelPricesApi.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFuelPriceByCity = (city: string) => {
  return useQuery({
    queryKey: ["fuel-prices", city],
    queryFn: () => fuelPricesApi.getByCity(city),
    enabled: !!city,
    staleTime: 10 * 60 * 1000,
  });
};

// Electricity Rates
export const useElectricityRates = () => {
  return useQuery({
    queryKey: ["electricity-rates"],
    queryFn: () => electricityRatesApi.getAll(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useElectricityRatesByState = (state: string) => {
  return useQuery({
    queryKey: ["electricity-rates", state],
    queryFn: () => electricityRatesApi.getByState(state),
    enabled: !!state,
    staleTime: 10 * 60 * 1000,
  });
};

// Reviews
export const useReviews = () => {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: () => reviewsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useReviewsByModel = (modelSlug: string) => {
  return useQuery({
    queryKey: ["reviews", "model", modelSlug],
    queryFn: () => reviewsApi.getByModel(modelSlug),
    enabled: !!modelSlug,
    staleTime: 5 * 60 * 1000,
  });
};

// Used Cars
export const useUsedCars = (city?: string) => {
  return useQuery({
    queryKey: ["used-cars", city],
    queryFn: () => {
      if (city) {
        return usedCarsApi.getByCity(city);
      }
      return usedCarsApi.getAll();
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUsedCar = (id: string) => {
  return useQuery({
    queryKey: ["used-cars", id],
    queryFn: () => usedCarsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Upcoming Cars
export const useUpcomingCars = () => {
  return useQuery({
    queryKey: ["upcoming-cars"],
    queryFn: () => upcomingCarsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

// Feature Flags
export const useFeatureFlags = () => {
  return useQuery({
    queryKey: ["feature-flags"],
    queryFn: () => featureFlagsApi.get(),
    staleTime: 5 * 60 * 1000,
  });
};

// Cities
export const useCities = () => {
  return useQuery({
    queryKey: ["cities"],
    queryFn: () => citiesApi.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes (cities don't change often)
  });
};

export const usePopularCities = () => {
  return useQuery({
    queryKey: ["cities", "popular"],
    queryFn: () => citiesApi.getPopular(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useCityBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["cities", slug],
    queryFn: () => citiesApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 30 * 60 * 1000,
  });
};

export const useSearchCities = (query: string) => {
  return useQuery({
    queryKey: ["cities", "search", query],
    queryFn: () => citiesApi.search(query),
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

// Search
export const useSearchCars = (params: {
  q?: string;
  brand?: string;
  bodyType?: string;
  fuelType?: string;
  priceMin?: number;
  priceMax?: number;
  city?: string;
}) => {
  return useQuery({
    queryKey: ["search", "cars", params],
    queryFn: () => searchApi.searchCars(params),
    enabled: !!(params.q || params.brand || params.bodyType || params.fuelType),
    staleTime: 2 * 60 * 1000,
  });
};

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ["search", "suggestions", query],
    queryFn: () => searchApi.getSuggestions(query),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePopularSearches = () => {
  return useQuery({
    queryKey: ["search", "popular"],
    queryFn: () => searchApi.getPopular(),
    staleTime: 10 * 60 * 1000,
  });
};

// Filters
export const useFilterOptions = () => {
  return useQuery({
    queryKey: ["filters", "options"],
    queryFn: () => filterApi.getOptions(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useFilteredCars = (filters: {
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
  return useQuery({
    queryKey: ["filters", "cars", filters],
    queryFn: () => filterApi.filterCars(filters),
    staleTime: 2 * 60 * 1000,
  });
};

// Popular API hooks
export const useMostSearchedCars = (bodyType?: string, limit?: number) => {
  return useQuery({
    queryKey: ["popular", "most-searched", bodyType, limit],
    queryFn: () => popularApi.getMostSearched(bodyType, limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePopularBrands = (limit?: number) => {
  return useQuery({
    queryKey: ["popular", "brands", limit],
    queryFn: () => popularApi.getPopularBrands(limit),
    staleTime: 10 * 60 * 1000,
  });
};

export const useTrendingComparisons = (limit?: number) => {
  return useQuery({
    queryKey: ["popular", "comparisons", limit],
    queryFn: () => popularApi.getTrendingComparisons(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLatestLaunches = (limit?: number) => {
  return useQuery({
    queryKey: ["popular", "latest-launches", limit],
    queryFn: () => popularApi.getLatestLaunches(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useElectricCars = (limit?: number) => {
  return useQuery({
    queryKey: ["popular", "electric-cars", limit],
    queryFn: () => popularApi.getElectricCars(limit),
    staleTime: 5 * 60 * 1000,
  });
};

