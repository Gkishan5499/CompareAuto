/**
 * Image URL Helper for CDN/Local Switching
 * 
 * Supports both local development (public folder) and production CDN (S3/Cloudflare R2)
 * via environment variable configuration.
 */

const USE_CDN = import.meta.env.VITE_USE_CDN === "true";
const CDN_BASE_URL = import.meta.env.VITE_CDN_BASE_URL || "";

/**
 * Get the full URL for an image, supporting both local and CDN sources
 * 
 * @param pathOrKey - Image path/key (e.g., "cars/honda/city/vx/white.png")
 * @returns Full URL to the image
 * 
 * @example
 * // Local: /cars/honda/city/vx/white.png
 * // CDN: https://cdn.example.com/cars/honda/city/vx/white.png
 * getImageUrl("cars/honda/city/vx/white.png")
 */
export const getImageUrl = (pathOrKey: string): string => {
  if (!pathOrKey) return "/placeholder.svg";
  
  // If already a full URL (http/https), return as-is
  if (pathOrKey.startsWith("http://") || pathOrKey.startsWith("https://")) {
    return pathOrKey;
  }

  // Remove leading slash if present for consistency
  const cleanPath = pathOrKey.startsWith("/") ? pathOrKey.slice(1) : pathOrKey;

  // Return CDN URL if enabled and configured
  if (USE_CDN && CDN_BASE_URL) {
    const baseUrl = CDN_BASE_URL.endsWith("/") ? CDN_BASE_URL.slice(0, -1) : CDN_BASE_URL;
    return `${baseUrl}/${cleanPath}`;
  }

  // Return local public path
  return `/${cleanPath}`;
};

/**
 * Get multiple image URLs at once
 * 
 * @param paths - Array of image paths
 * @returns Array of full URLs
 */
export const getImageUrls = (paths: string[]): string[] => {
  return paths.map(getImageUrl);
};

/**
 * Get car image URL with standard naming convention
 * 
 * @param brand - Brand name (lowercase)
 * @param model - Model name (lowercase)
 * @param variant - Variant name (lowercase)
 * @param color - Color name (lowercase)
 * @param angle - Optional angle (front, side, rear, interior)
 * @returns Full URL to the car image
 * 
 * @example
 * getCarImageUrl("honda", "city", "vx", "white", "front")
 * // Returns: /cars/honda/city/vx/white_front.png (or CDN equivalent)
 */
export const getCarImageUrl = (
  brand: string,
  model: string,
  variant: string,
  color: string,
  angle?: string
): string => {
  const brandSlug = brand.toLowerCase().replace(/\s+/g, "-");
  const modelSlug = model.toLowerCase().replace(/\s+/g, "-");
  const variantSlug = variant.toLowerCase().replace(/\s+/g, "-");
  const colorSlug = color.toLowerCase().replace(/\s+/g, "-");
  
  const angleSuffix = angle ? `_${angle}` : "";
  const filename = `${brandSlug}_${modelSlug}_${variantSlug}_${colorSlug}${angleSuffix}.png`;
  
  return getImageUrl(`cars/${brandSlug}/${modelSlug}/${variantSlug}/${filename}`);
};

/**
 * Get used car image URL with standard naming convention
 * 
 * @param city - City slug
 * @param id - Car listing ID
 * @param index - Image index (0-based)
 * @returns Full URL to the used car image
 * 
 * @example
 * getUsedCarImageUrl("delhi-ncr", "UC123", 0)
 * // Returns: /used/delhi-ncr/uc123/0.png (or CDN equivalent)
 */
export const getUsedCarImageUrl = (city: string, id: string, index: number): string => {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  const idLower = id.toLowerCase();
  
  return getImageUrl(`used/${citySlug}/${idLower}/${index}.png`);
};

/**
 * Preload critical images for performance
 * Call this for above-the-fold hero images
 * 
 * @param urls - Array of image URLs to preload
 */
export const preloadImages = (urls: string[]): void => {
  if (typeof window === "undefined") return;
  
  urls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Image dimension presets for different use cases
 */
export const IMAGE_DIMENSIONS = {
  hero: { width: 1600, height: 900 },
  gallery: { width: 1200, height: 675 },
  card: { width: 600, height: 400 },
  thumbnail: { width: 150, height: 100 },
  swatch: { width: 80, height: 80 },
} as const;
