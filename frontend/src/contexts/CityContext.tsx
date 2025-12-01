import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CityContextType {
  city: string;
  setCity: (city: string) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

const CITY_STORAGE_KEY = "compareauto_city";
const DEFAULT_CITY = "Delhi NCR";

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCityState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(CITY_STORAGE_KEY) || DEFAULT_CITY;
    }
    return DEFAULT_CITY;
  });

  const setCity = (newCity: string) => {
    setCityState(newCity);
    if (typeof window !== "undefined") {
      localStorage.setItem(CITY_STORAGE_KEY, newCity);
    }
  };

  useEffect(() => {
    // Sync with localStorage on mount
    const stored = localStorage.getItem(CITY_STORAGE_KEY);
    if (stored) {
      setCityState(stored);
    }
  }, []);

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error("useCity must be used within CityProvider");
  }
  return context;
};
