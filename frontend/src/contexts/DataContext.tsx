/**
 * Data Context Provider
 * Pre-loads essential data and provides it to components
 */
import { createContext, useContext, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useBrands,
  useModels,
  useVariants,
  useArticles,
  useComparisons,
} from "@/lib/api-hooks";

interface DataContextValue {
  brands: any[];
  models: any[];
  variants: any[];
  articles: any[];
  comparisons: any[];
  isLoading: boolean;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: models = [], isLoading: modelsLoading } = useModels();
  const { data: articles = [], isLoading: articlesLoading } = useArticles();
  const { data: comparisons = [], isLoading: comparisonsLoading } = useComparisons();

  // For variants, we'll load them on-demand, but we can pre-fetch all if needed
  const queryClient = useQueryClient();
  const variants: any[] = [];

  const isLoading =
    brandsLoading || modelsLoading || articlesLoading || comparisonsLoading;

  return (
    <DataContext.Provider
      value={{
        brands,
        models,
        variants,
        articles,
        comparisons,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

