/**
 * Central brand logo mapping and utility functions
 */

export const brandLogos: Record<string, string> = {
  'Honda': '/brands/honda.webp',
  'Hyundai': '/brands/hyundai.webp',
  'Kia': '/brands/kia.webp',
  'Mahindra': '/brands/mahindra.webp',
  'MG': '/brands/mg.webp',
  'MG Motor': '/brands/mg.webp',
  'Maruti Suzuki': '/brands/maruti-suzuki.webp',
  'Tata': '/brands/tata.webp',
  'Tata Motors': '/brands/tata.webp',
  'Toyota': '/brands/toyota.webp',
};

/**
 * Get brand logo URL with fallback to null if not found
 */
export const getBrandLogo = (brandName: string | undefined): string | null => {
  if (!brandName) return null;
  return brandLogos[brandName] || null;
};

/**
 * Get first letter of brand name for fallback placeholder
 */
export const getBrandInitial = (brandName: string | undefined): string => {
  if (!brandName) return '?';
  return brandName.charAt(0).toUpperCase();
};
