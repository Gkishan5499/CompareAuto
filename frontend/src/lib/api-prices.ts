// API stubs for fuel and electricity prices

import { getFuelPrice, getElectricityRates, FuelPrice, ElectricityRatesResponse } from "./prices";
import { getVariant } from "./data";

// On-road price breakup interface
export interface OnRoadPriceBreakup {
  exShowroom: number;
  rto: number;
  insurance: number;
  others: number;
  onRoad: number;
}

// Mock API: Get fuel price by city
export const apiFuelPrice = async (city: string): Promise<FuelPrice | { error: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const price = getFuelPrice(city);
  if (!price) {
    return { error: "City not found" };
  }

  return price;
};

// Mock API: Get electricity rate by state and DISCOM
export const apiElectricityRate = async (
  state: string,
  discom: string
): Promise<ElectricityRatesResponse | { error: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const rates = getElectricityRates({ stateSlug: state, discomSlug: discom });
  if (!rates) {
    return { error: "State or DISCOM not found" };
  }

  return rates;
};

// Mock API: Get on-road price breakup for a variant in a city
export const getOnRoadPrice = async (
  variantId: string,
  city: string
): Promise<OnRoadPriceBreakup> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Get variant data to get base price
  const variant = await Promise.resolve().then(() => {
    // This is a simplified lookup - in production this would query a database
    const allVariants = JSON.parse(localStorage.getItem("variantData") || "[]");
    return allVariants.find((v: any) => v.id === variantId);
  });

  const exShowroom = variant?.price || 800000;

  // Mock calculations (typical percentages)
  const rto = Math.round(exShowroom * 0.12); // ~12% RTO
  const insurance = Math.round(exShowroom * 0.03); // ~3% insurance
  const others = 15000; // Fixed other charges

  return {
    exShowroom,
    rto,
    insurance,
    others,
    onRoad: exShowroom + rto + insurance + others,
  };
};
