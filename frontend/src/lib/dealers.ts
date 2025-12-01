/**
 * Dealers Library
 * Functions for managing and querying dealer data
 */

import { dealersApi } from "./api";

// Cache for dealers data
let dealersCache: Dealer[] = [];
let dealersInitialized = false;

export const setDealers = (data: Dealer[]) => {
  dealersCache = data;
};

export const setDealersInitialized = (value: boolean) => {
  dealersInitialized = value;
};

export interface DealerAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface DealerHours {
  mon_sat: string;
  sun: string;
}

export interface DealerLocation {
  lat: number;
  lng: number;
}

export interface Dealer {
  id: string;
  name: string;
  brands: string[];
  categories: string[];
  dealerCode: string;
  address: DealerAddress;
  phones: string[];
  email: string;
  website: string;
  hours: DealerHours;
  location: DealerLocation;
  rating: number;
  verified: boolean;
  updated: string;
  images: string[];
}

export interface DealerListParams {
  q?: string; // Search query
  brand?: string;
  city?: string;
  state?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface DealerListResult {
  items: Dealer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * List dealers with filtering and pagination
 */
export function listDealers(params: DealerListParams = {}): DealerListResult {
  const {
    q = "",
    brand,
    city,
    state,
    category,
    page = 1,
    pageSize = 20,
  } = params;

  let filtered = dealersCache;

  // Search by name, brands, or city
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (dealer) =>
        dealer.name.toLowerCase().includes(query) ||
        dealer.brands.some((b) => b.toLowerCase().includes(query)) ||
        dealer.address.city.toLowerCase().includes(query) ||
        dealer.address.state.toLowerCase().includes(query)
    );
  }

  // Filter by brand
  if (brand && brand !== "all") {
    filtered = filtered.filter((dealer) =>
      dealer.brands.some((b) => b.toLowerCase() === brand.toLowerCase())
    );
  }

  // Filter by city
  if (city && city !== "all") {
    filtered = filtered.filter(
      (dealer) => dealer.address.city.toLowerCase() === city.toLowerCase()
    );
  }

  // Filter by state
  if (state && state !== "all") {
    filtered = filtered.filter(
      (dealer) => dealer.address.state.toLowerCase() === state.toLowerCase()
    );
  }

  // Filter by category
  if (category && category !== "all") {
    filtered = filtered.filter((dealer) =>
      dealer.categories.some((c) => c.toLowerCase() === category.toLowerCase())
    );
  }

  // Calculate pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filtered.slice(start, end);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Get a single dealer by ID
 */
export function getDealerById(id: string): Dealer | null {
  const dealer = dealersCache.find((d) => d.id === id);
  return dealer || null;
}

/**
 * Get unique list of states from dealers
 */
export function listStates(): string[] {
  const states = new Set<string>();
  dealersCache.forEach((dealer) => {
    states.add(dealer.address.state);
  });
  return Array.from(states).sort();
}

/**
 * Get unique list of cities, optionally filtered by state
 */
export function listCities(state?: string): string[] {
  let dealers = dealersCache;

  if (state && state !== "all") {
    dealers = dealers.filter(
      (d) => d.address.state.toLowerCase() === state.toLowerCase()
    );
  }

  const cities = new Set<string>();
  dealers.forEach((dealer) => {
    cities.add(dealer.address.city);
  });

  return Array.from(cities).sort();
}

/**
 * Get unique list of brands from all dealers
 */
export function listBrandsFromDealers(): string[] {
  const brands = new Set<string>();
  dealersCache.forEach((dealer) => {
    dealer.brands.forEach((brand) => brands.add(brand));
  });
  return Array.from(brands).sort();
}

/**
 * Get unique list of categories
 */
export function listCategories(): string[] {
  return ["Sales", "Service", "Spares"];
}

/**
 * Count dealers by state
 */
export function countDealersByState(): Record<string, number> {
  const counts: Record<string, number> = {};
  dealersCache.forEach((dealer) => {
    const state = dealer.address.state;
    counts[state] = (counts[state] || 0) + 1;
  });
  return counts;
}

/**
 * Count dealers by city
 */
export function countDealersByCity(): Record<string, number> {
  const counts: Record<string, number> = {};
  dealersCache.forEach((dealer) => {
    const city = dealer.address.city;
    counts[city] = (counts[city] || 0) + 1;
  });
  return counts;
}

/**
 * Get popular cities (top 10 by dealer count)
 */
export function getPopularCities(): Array<{ city: string; count: number }> {
  const counts = countDealersByCity();
  return Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
