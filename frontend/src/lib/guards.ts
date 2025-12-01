/**
 * Type guards and data validation utilities
 * Prevents runtime errors from null/undefined/invalid data
 */

/**
 * Asserts that a value is non-empty
 * @throws Error if value is null, undefined, or empty string
 */
export function assertNonEmpty<T>(
  value: T | null | undefined,
  name: string
): asserts value is T {
  if (value === null || value === undefined || value === "") {
    throw new Error(`${name} is required but was ${value}`);
  }
}

/**
 * Safely converts value to number with fallback
 */
export function safeNumber(
  value: unknown,
  fallback: number | null = null
): number | null {
  if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

/**
 * Formats number as Indian Rupees
 * @param value - Number to format (in paisa or rupees based on context)
 * @param inLakhs - If true, formats as lakhs (₹X.XX L)
 * @returns Formatted string or "—" for invalid values
 */
export function formatINR(
  value: number | null | undefined,
  inLakhs = false
): string {
  const num = safeNumber(value);
  if (num === null) return "—";

  if (inLakhs) {
    // Assume value is in rupees, convert to lakhs
    return `₹${(num / 100000).toFixed(2)} L`;
  }

  // Format as full rupees with commas
  return `₹${num.toLocaleString("en-IN")}`;
}

/**
 * Safely extracts price range text
 */
export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined
): string {
  const minVal = safeNumber(min);
  const maxVal = safeNumber(max);

  if (minVal === null && maxVal === null) return "—";
  if (minVal === null) return `Up to ${formatINR(maxVal, true)}`;
  if (maxVal === null) return `From ${formatINR(minVal, true)}`;
  if (minVal === maxVal) return formatINR(minVal, true);

  return `${formatINR(minVal, true)} - ${formatINR(maxVal, true)}`;
}

/**
 * Parse a human readable INR price string (eg. "10.50 Lakh", "₹1,05,000", "10.5 L") and
 * normalize numeric values into rupees as a number. Handles numbers in lakhs or thousands.
 */
export function parseINRToRupees(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  // If it's already a number, try to guess units: values <= 1000 treated as lakhs
  if (typeof value === "number") {
    if (!isFinite(value) || isNaN(value)) return null;
    if (value === 0) return 0; // keep explicit zero
    if (value > 0 && value <= 1000) {
      // Heuristic: value in lakhs (e.g. 10.5 -> 10.5 L)
      return value * 100000;
    }
    return value; // already rupees
  }

  if (typeof value === "string") {
    let s = value.replace(/₹|,/g, "").toLowerCase().trim();
    if (!s) return null;
    let multiplier = 1;
    // Lakh / Lac / L
    if (/lakh$/.test(s)) {
      multiplier = 100000;
      s = s.replace(/lakh$/, "").trim();
    } else if (/lac$/.test(s)) {
      multiplier = 100000;
      s = s.replace(/lac$/, "").trim();
    } else if (/\s*l$/.test(s)) {
      multiplier = 100000;
      s = s.replace(/\s*l$/, "").trim();
    } else if (/k$/.test(s)) {
      multiplier = 1000;
      s = s.replace(/k$/, "").trim();
    }

    const parsed = parseFloat(s);
    if (isNaN(parsed)) return null;
    return parsed * multiplier;
  }

  return null;
}

/**
 * Validates Indian mobile number (10 digits)
 */
export function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.trim());
}

/**
 * Validates Indian PIN code (6 digits)
 */
export function isValidPincode(pin: string): boolean {
  return /^\d{6}$/.test(pin.trim());
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Safely clamps a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Checks if viewport is overflowing horizontally
 */
export function detectHorizontalOverflow(): HTMLElement[] {
  if (typeof window === "undefined") return [];
  
  const overflowing: HTMLElement[] = [];
  const viewportWidth = window.innerWidth;
  
  document.querySelectorAll("*").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width > viewportWidth) {
      overflowing.push(el as HTMLElement);
    }
  });
  
  return overflowing;
}

/**
 * Generates a unique reference ID
 */
export function generateRefId(prefix = "REF"): string {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${dateStr}-${random}`;
}
