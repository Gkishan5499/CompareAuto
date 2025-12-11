/**
 * Unified pricing types for admin panel
 * Shared with backend and frontend
 */

export type FuelType = 'petrol' | 'diesel' | 'ev';

export interface PriceInput {
  stateCode: string;          // e.g. 'DL', 'HR'
  city?: string;              // optional, used where needed (e.g. Mumbai vs Pune)
  exShowroom: number;         // in rupees
  fuelType: FuelType;
  engineCc: number;
}

export interface StateCharges {
  rto: number;
  mcd?: number;
  roadSafetyCess?: number;
  registrationFee?: number;
  notes: string[];
}

export interface InsuranceBreakup {
  premium: number;
  approxPercent: number;
  notes: string[];
}

export interface PriceBreakdown {
  exShowroom: number;
  stateCode: string;
  city?: string;
  fuelType: FuelType;
  engineCc: number;
  rto: number;
  mcd: number;
  roadSafetyCess: number;
  registrationFee: number;
  insurance: number;
  tcs: number;
  fastag: number;
  otherCharges: number;
  onRoad: number;
  notes: string[];
}

/**
 * Legacy type for backward compatibility with existing tax config storage
 * Deprecated: Use StateCharges instead
 */
export interface LegacyStateCharges {
  rto?: number;
  mcd?: number;
  roadSafetyCess?: number;
  registrationFee?: number;
  notes?: string[];
}

/**
 * Legacy input type for backward compatibility
 * Deprecated: Use PriceInput instead
 */
export interface LegacyPriceInput {
  exShowroom: number;
  stateCode?: string;
  city?: string;
  fuelType?: FuelType;
  engineCc?: number;
}
