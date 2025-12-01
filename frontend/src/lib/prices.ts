// Prices data cache - populated by DataLoader

// Cache for prices data
let fuelPricesCache: any[] = [];
let electricityRatesCache: any[] = [];
let pricesInitialized = false;

export const setFuelPrices = (data: any[]) => {
  fuelPricesCache = data;
};

export const setElectricityRates = (data: any[]) => {
  electricityRatesCache = data;
};

export const setPricesInitialized = (value: boolean) => {
  pricesInitialized = value;
};

export interface FuelPrice {
  city: string;
  cityName: string;
  petrol: number;
  diesel: number;
  cng: number | null;
  updated: string;
}

export interface ElectricityRate {
  state: string;
  stateName: string;
  discom: string;
  discomName: string;
  slab: string;
  ratePerUnit: number;
  fixedPerDay: number;
  updated: string;
}

export interface ElectricityRatesResponse {
  state: string;
  stateName: string;
  discom: string;
  discomName: string;
  slabs: Array<{
    slab: string;
    ratePerUnit: number;
    fixedPerDay: number;
  }>;
  updated: string;
}

// Get all available cities
export const listCities = (): Array<{ slug: string; name: string }> => {
  return fuelPricesCache.map((item) => ({
    slug: item.city,
    name: item.cityName,
  }));
};

// Get all available states
export const listStates = (): Array<{ slug: string; name: string }> => {
  const uniqueStates = new Map<string, string>();
  electricityRatesCache.forEach((item) => {
    if (!uniqueStates.has(item.state)) {
      uniqueStates.set(item.state, item.stateName);
    }
  });
  return Array.from(uniqueStates.entries()).map(([slug, name]) => ({ slug, name }));
};

// Get all DISCOMs for a specific state
export const listDiscoms = (stateSlug: string): Array<{ slug: string; name: string }> => {
  const uniqueDiscoms = new Map<string, string>();
  electricityRatesCache
    .filter((item) => item.state === stateSlug)
    .forEach((item) => {
      if (!uniqueDiscoms.has(item.discom)) {
        uniqueDiscoms.set(item.discom, item.discomName);
      }
    });
  return Array.from(uniqueDiscoms.entries()).map(([slug, name]) => ({ slug, name }));
};

// Get fuel price for a specific city
export const getFuelPrice = (citySlug: string): FuelPrice | null => {
  const price = fuelPricesCache.find((item) => item.city === citySlug);
  return price || null;
};

// Get electricity rates for a specific state and DISCOM
export const getElectricityRates = ({
  stateSlug,
  discomSlug,
}: {
  stateSlug: string;
  discomSlug: string;
}): ElectricityRatesResponse | null => {
  const rates = electricityRatesCache.filter(
    (item) => item.state === stateSlug && item.discom === discomSlug
  );

  if (rates.length === 0) return null;

  const firstRate = rates[0];
  return {
    state: firstRate.state,
    stateName: firstRate.stateName,
    discom: firstRate.discom,
    discomName: firstRate.discomName,
    slabs: rates.map((rate) => ({
      slab: rate.slab,
      ratePerUnit: rate.ratePerUnit,
      fixedPerDay: rate.fixedPerDay,
    })),
    updated: firstRate.updated,
  };
};
