/**
 * Data Loader Component
 * Pre-fetches all essential data on app start and populates the cache
 */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { dataCache } from "@/lib/data-cache";
import {
  brandsApi,
  modelsApi,
  variantsApi,
  articlesApi,
  comparisonsApi,
  reviewsApi,
  usedCarsApi,
  fuelPricesApi,
  electricityRatesApi,
  dealersApi,
} from "@/lib/api";
import { setFuelPrices, setElectricityRates, setPricesInitialized } from "@/lib/prices";
import { setDealers, setDealersInitialized } from "@/lib/dealers";

const DataLoader = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all essential data in parallel
        const [
          brands,
          models,
          variants,
          articles,
          comparisons,
          reviews,
          usedCars,
          fuelPrices,
          electricityRates,
          dealers,
        ] = await Promise.all([
          brandsApi.getAll(),
          modelsApi.getAll(),
          variantsApi.getAll(),
          articlesApi.getAll(),
          comparisonsApi.getAll(),
          reviewsApi.getAll(),
          usedCarsApi.getAll(),
          fuelPricesApi.getAll(),
          electricityRatesApi.getAll(),
          dealersApi.getAll(),
        ]);

        // Populate cache
        dataCache.setBrands(brands);
        dataCache.setModels(models);
        dataCache.setVariants(variants);
        dataCache.setArticles(articles);
        dataCache.setComparisons(comparisons);
        dataCache.setReviews(reviews);
        dataCache.setUsedCars(usedCars);
        dataCache.setInitialized(true);

        // Populate prices cache
        setFuelPrices(fuelPrices);
        setElectricityRates(electricityRates);
        setPricesInitialized(true);

        // Populate dealers cache
        setDealers(dealers);
        setDealersInitialized(true);

        // Also populate React Query cache
        queryClient.setQueryData(["brands"], brands);
        queryClient.setQueryData(["models"], models);
        queryClient.setQueryData(["variants"], variants);
        queryClient.setQueryData(["articles"], articles);
        queryClient.setQueryData(["comparisons"], comparisons);
        queryClient.setQueryData(["reviews"], reviews);
        queryClient.setQueryData(["used-cars"], usedCars);
        queryClient.setQueryData(["fuel-prices"], fuelPrices);
        queryClient.setQueryData(["electricity-rates"], electricityRates);
        queryClient.setQueryData(["dealers"], dealers);
      } catch (error) {
        console.error("Error loading data:", error);
        // Set initialized anyway to prevent infinite loading
        dataCache.setInitialized(true);
      }
    };

    if (!dataCache.isInitialized()) {
      loadData();
    }
  }, [queryClient]);

  return null; // This component doesn't render anything
};

export default DataLoader;

