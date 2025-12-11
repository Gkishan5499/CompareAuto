// Detailed on-road price helper using manual state rules
// This is a supplemental calculator; backend tax configs remain the primary source.

import type { PriceInput, FuelType, StateCharges, InsuranceBreakup, PriceBreakdown } from '../types/pricing';

export type { PriceInput, FuelType, StateCharges, InsuranceBreakup, PriceBreakdown } from '../types/pricing';

function pct(amount: number, rate: number): number {
  return Math.round(amount * rate);
}

// Insurance with segment/fuel/state uplifts
export function calcInsurance(input: PriceInput): InsuranceBreakup {
  const { exShowroom, fuelType, stateCode } = input;
  const notes: string[] = [];

  let basePercent = 0.056;

  if (exShowroom < 500000) {
    basePercent = 0.058;
  } else if (exShowroom > 1000000 && exShowroom <= 2000000) {
    basePercent = 0.052;
  } else if (exShowroom > 2000000) {
    basePercent = 0.05;
  }

  const fuel = fuelType?.toLowerCase();
  if (fuel === "diesel") {
    basePercent += 0.002;
    notes.push("Diesel insurance uplift applied.");
  } else if (fuel === "ev" || fuel === "electric") {
    basePercent += 0.01;
    notes.push("EV insurance uplift applied.");
  }

  const upperState = stateCode?.toUpperCase?.() || "";
  if (upperState === "KA") {
    basePercent += 0.003;
    notes.push("Karnataka uplift applied (historically higher quotes).");
  }

  const premium = Math.round(exShowroom * basePercent);
  notes.push(`Approx insurance ~${(basePercent * 100).toFixed(2)}% of ex-showroom.`);

  return {
    premium,
    approxPercent: basePercent,
    notes,
  };
}

// State-level RTO/cess/fees
export function calcStateCharges(input: PriceInput): StateCharges {
  const { stateCode, city, exShowroom, fuelType } = input;
  const code = stateCode.toUpperCase();
  const notes: string[] = [];

  let rto = 0;
  let mcd = 0;
  let roadSafetyCess = 0;
  let registrationFee = 0;

  switch (code) {
    case "DL": {
      let baseRate: number;
      if (exShowroom < 600000) {
        baseRate = 0.053;
      } else if (exShowroom < 1000000) {
        baseRate = 0.0775;
      } else {
        baseRate = 0.1075;
      }

      if (fuelType === "diesel") {
        baseRate += 0.024;
        notes.push("Diesel surcharge applied in Delhi.");
      } else if (fuelType === "ev") {
        notes.push("EV taxed same slab as petrol in Delhi.");
      }

      rto = pct(exShowroom, baseRate);
      mcd = 4000;
      notes.push(`Delhi RTO slab rate ~${(baseRate * 100).toFixed(2)}%.`);
      break;
    }

    case "HR": {
      let rate: number;
      if (exShowroom < 600000) {
        rate = 0.06;
      } else {
        rate = 0.0875;
      }
      rto = pct(exShowroom, rate);
      notes.push(`Haryana RTO slab rate ~${(rate * 100).toFixed(2)}%. Fuel-type neutral.`);
      break;
    }

    case "WB": {
      if (fuelType === "ev") {
        rto = 8000;
        notes.push("Flat EV RTO assumed for West Bengal (₹8,000).");
      } else {
        let rate: number;
        if (exShowroom < 500000) {
          rate = 0.06;
        } else if (exShowroom <= 2000000) {
          rate = 0.1075;
        } else {
          rate = 0.12;
        }
        rto = pct(exShowroom, rate);
        notes.push(`West Bengal RTO slab rate ~${(rate * 100).toFixed(2)}%.`);
      }
      break;
    }

    case "MH": {
      const isMumbai = city ? city.toLowerCase().includes("mumbai") : false;
      const isPune = city ? city.toLowerCase().includes("pune") : false;

      if (fuelType === "ev") {
        rto = isPune ? 2358 : 3000;
        roadSafetyCess = isPune ? 47 : 60;
        notes.push("Maharashtra EV concessional RTO applied (~₹2–3k + cess).");
      } else {
        let baseRate: number;
        if (exShowroom < 1000000) {
          baseRate = 0.118;
        } else {
          baseRate = 0.1275;
        }
        if (fuelType === "diesel") {
          baseRate += 0.02;
          notes.push("Diesel surcharge applied in Maharashtra.");
        }
        rto = pct(exShowroom, baseRate);
        roadSafetyCess = exShowroom < 800000 ? 1309 : exShowroom < 1100000 ? 1417 : 2734;
        notes.push(`Maharashtra RTO slab rate ~${(baseRate * 100).toFixed(2)}%.`);
      }
      break;
    }

    case "KA": {
      const isEv = fuelType === "ev";
      if (isEv) {
        rto = 8000;
        registrationFee = 3662;
        roadSafetyCess = 1000;
        notes.push("Karnataka EV concessional RTO applied (flat fees).");
      } else {
        let rate: number;
        if (exShowroom < 600000) {
          rate = 0.157;
        } else if (exShowroom < 1000000) {
          rate = 0.16;
        } else {
          rate = 0.189;
        }
        rto = pct(exShowroom, rate);
        roadSafetyCess = 1000;
        registrationFee = 1862;
        notes.push(`Karnataka RTO slab rate ~${(rate * 100).toFixed(2)}%.`);
      }
      break;
    }

    default: {
      let baseRate = 0.1;
      if (fuelType === "diesel") {
        baseRate += 0.02;
        notes.push("Diesel fuel: generic +2% surcharge.");
      }
      rto = pct(exShowroom, baseRate);
      notes.push(`Generic fallback RTO rate ~${(baseRate * 100).toFixed(2)}% used for ${code}.`);
    }
  }

  return {
    rto,
    mcd,
    roadSafetyCess,
    registrationFee,
    notes,
  };
}

function calcTcs(exShowroom: number): number {
  if (exShowroom >= 1000000) {
    return Math.round(exShowroom * 0.01);
  }
  return 0;
}

function calcFastag(stateCode: string, city?: string): number {
  const code = stateCode.toUpperCase();
  if (code === "KA") return 600;
  if (code === "MH") {
    if (city && city.toLowerCase().includes("pune")) return 750;
    return 500;
  }
  return 500;
}

// Full on-road price assembly using the manual rules above
export function calculateOnRoadPrice(input: PriceInput): PriceBreakdown {
  const stateCharges = calcStateCharges(input);
  const insurance = calcInsurance(input);

  const tcs = calcTcs(input.exShowroom);
  const fastag = calcFastag(input.stateCode, input.city);

  const mcd = stateCharges.mcd ?? 0;
  const roadSafetyCess = stateCharges.roadSafetyCess ?? 0;
  const registrationFee = stateCharges.registrationFee ?? 0;

  const otherCharges = tcs + fastag;
  const rtoTotal = stateCharges.rto + mcd + roadSafetyCess + registrationFee;

  const onRoad =
    input.exShowroom +
    rtoTotal +
    insurance.premium +
    tcs +
    fastag;

  const notes: string[] = [];
  notes.push(...stateCharges.notes);
  notes.push(...insurance.notes);

  return {
    exShowroom: input.exShowroom,
    stateCode: input.stateCode.toUpperCase(),
    city: input.city,
    fuelType: input.fuelType,
    engineCc: input.engineCc,
    rto: stateCharges.rto,
    mcd,
    roadSafetyCess,
    registrationFee,
    insurance: insurance.premium,
    tcs,
    fastag,
    otherCharges,
    onRoad,
    notes,
  };
}
