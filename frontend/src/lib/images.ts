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
 * Get color-based gallery images for a variant
 * Maps color names to images from the model's gallery based on their filenames
 * 
 * Flexible matching for patterns like:
 * 1. {brand}_{model}_{variant}_{color}_{anything}.{jpg|png}
 * 2. {brand}_{model}_{color}_{anything}.{jpg|png}
 * 3. {brand}_{model}_{color}.{jpg|png}
 * 
 * @param brand - Brand name
 * @param model - Model name
 * @param variant - Variant name (optional, for detailed matching)
 * @param colors - Array of color names
 * @param galleryUrls - Optional array of pre-uploaded gallery image URLs
 * @param dualToneColors - Optional array of dual-tone color combinations to exclude from monotone matching
 * @returns Object mapping color -> array of image URLs
 */
export const getColorImageGallery = (
  brand: string,
  model: string,
  variant: string,
  colors: string[],
  galleryUrls: string[] = [],
  dualToneColors: Array<{ primary: string; secondary: string }> = []
): Record<string, string[]> => {
  // Normalize slugs: replace hyphens with underscores to match filenames
  const brandSlug = brand.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  const modelSlug = model.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  const variantSlug = variant.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");

  const colorGallery: Record<string, string[]> = {};

  console.log("🎨 Color Image Gallery Debug - Setup:", {
    brand: brandSlug,
    model: modelSlug,
    variant: variantSlug,
    colors,
    dualToneColors,
    galleryUrlsCount: galleryUrls?.length || 0,
  });

  // If gallery URLs provided, use them directly
  if (galleryUrls && galleryUrls.length > 0) {
    colors.forEach((color) => {
      const colorSlug = color.toLowerCase().replace(/\s+/g, "_");
      
      console.log(`\n🔍 [COLOR: ${color}] Looking for colorSlug: "${colorSlug}"`);
      
      // Find all gallery images that match this color using multiple patterns
      const matchingImages = galleryUrls.filter((url) => {
        // Extract filename from URL (last part after /)
        const fullPath = url.split("/");
        const filename = fullPath[fullPath.length - 1]?.toLowerCase() || "";
        
        // Create alternative model slug without underscores for flexible matching
        // e.g., "xuv_3xo" -> "xuv3xo"
        const modelSlugNoUnderscore = modelSlug.replace(/_/g, "");
        
        // Pattern 1: {brand}_{model}_{variant}_{color}
        const pattern1 = `${brandSlug}_${modelSlug}_${variantSlug}_${colorSlug}`;
        const pattern1Alt = `${brandSlug}_${modelSlugNoUnderscore}_${variantSlug}_${colorSlug}`;
        
        // Pattern 2: {brand}_{model}_{color} (simpler, matches most uploads)
        const pattern2 = `${brandSlug}_${modelSlug}_${colorSlug}`;
        const pattern2Alt = `${brandSlug}_${modelSlugNoUnderscore}_${colorSlug}`;
        
        const match1 = filename.includes(pattern1) || filename.includes(pattern1Alt);
        const match2 = filename.includes(pattern2) || filename.includes(pattern2Alt);
        const matches = match1 || match2;
        
        if (!matches) return false;
        
        // Remove file extension for cleaner matching
        const filenameNoExt = filename.replace(/\.(jpg|jpeg|png|webp)$/i, "");
        
        // For monotone colors, EXCLUDE images that match dual-tone patterns
        // Method 1: Check against explicit dual-tone list from specs
        for (const dualTone of dualToneColors) {
          const primarySlug = dualTone.primary.toLowerCase().replace(/\s+/g, "_");
          const secondarySlug = dualTone.secondary.toLowerCase().replace(/\s+/g, "_");
          
          // Dual-tone pattern: brand_model_variant_primary_secondary or brand_model_primary_secondary
          const dualPattern1 = `${brandSlug}_${modelSlug}_${variantSlug}_${primarySlug}_${secondarySlug}`;
          const dualPattern2 = `${brandSlug}_${modelSlug}_${primarySlug}_${secondarySlug}`;
          const dualPattern1Alt = `${brandSlug}_${modelSlugNoUnderscore}_${variantSlug}_${primarySlug}_${secondarySlug}`;
          const dualPattern2Alt = `${brandSlug}_${modelSlugNoUnderscore}_${primarySlug}_${secondarySlug}`;
          
          // If this image matches a dual-tone pattern, exclude it from monotone
          if (filenameNoExt.includes(dualPattern1) || filenameNoExt.includes(dualPattern2) ||
              filenameNoExt.includes(dualPattern1Alt) || filenameNoExt.includes(dualPattern2Alt)) {
            console.log(`  ❌ [${color}] Excluded dual-tone: ${filename.substring(0, 50)}...`);
            return false;
          }
        }
        
        // Method 2: Auto-detect dual-tone by checking if filename has extra segments after color
        // Monotone patterns: brand_model_color or brand_model_variant_color
        // Dual-tone patterns: brand_model_color_secondarycolor or brand_model_variant_color_secondarycolor
        const expectedPattern1End = pattern1; // brand_model_variant_color
        const expectedPattern2End = pattern2; // brand_model_color
        const expectedPattern1AltEnd = pattern1Alt; // brand_model_variant_color (no underscore in model)
        const expectedPattern2AltEnd = pattern2Alt; // brand_model_color (no underscore in model)
        
        // Check if filename has content AFTER the expected monotone pattern (excluding common suffixes)
        const afterPattern1 = filenameNoExt.replace(expectedPattern1End, "").replace(expectedPattern1AltEnd, "");
        const afterPattern2 = filenameNoExt.replace(expectedPattern2End, "").replace(expectedPattern2AltEnd, "");
        
        // If there's additional content after the color (beyond just _ or angle/descriptor), it's likely dual-tone
        const hasExtraColorSegment = (remaining: string) => {
          if (!remaining) return false;
          // Allow common single-word descriptors/angles (front, side, rear, etc.)
          const commonSuffixes = /^_(front|side|rear|interior|angle|view|\d+)$/i;
          if (commonSuffixes.test(remaining)) return false;
          // If it starts with underscore and has more content, likely a second color
          return remaining.startsWith("_") && remaining.length > 1;
        };
        
        if ((match1 && hasExtraColorSegment(afterPattern1)) || (match2 && hasExtraColorSegment(afterPattern2))) {
          console.log(`  ❌ [${color}] Auto-detected dual-tone: ${filename.substring(0, 50)}...`);
          return false;
        }
        
        return true;
      });

      if (matchingImages.length > 0) {
        colorGallery[color] = matchingImages;
        console.log(`  ✅ MATCHED: Found ${matchingImages.length} image(s) for "${color}"`);
      } else {
        console.log(`  ❌ NO MATCH for "${color}"`);
      }
    });

    console.log("\n🎨 Final Color Gallery Mapping:", colorGallery);
    console.log("🎨 Total colors with images:", Object.keys(colorGallery).length, "out of", colors.length);
    return colorGallery;
  }

  console.log("⚠️ No gallery URLs provided, cannot match images");

  // Fallback: try to construct URLs if no gallery URLs provided
  colors.forEach((color) => {
    const colorSlug = color.toLowerCase().replace(/\s+/g, "_");
    
    const angles = ["front", "side", "rear", "interior"];
    const images: string[] = [];

    // Try angle-based naming
    for (const angle of angles) {
      const filenameWithAngle = `${brandSlug}_${modelSlug}_${colorSlug}_${angle}`;
      
      for (const ext of ["png", "jpg", "jpeg"]) {
        const url = getImageUrl(`cars/${brandSlug}/${modelSlug}/${variantSlug}/${filenameWithAngle}.${ext}`);
        images.push(url);
      }
    }

    // Try descriptor-based naming
    const descriptors = ["galvono_grey", "matte", "pearl", "metallic"];
    for (const descriptor of descriptors) {
      const filenameWithDescriptor = `${brandSlug}_${modelSlug}_${colorSlug}_${descriptor}`;
      
      for (const ext of ["jpg", "jpeg", "png"]) {
        const url = getImageUrl(`cars/${brandSlug}/${modelSlug}/${variantSlug}/${filenameWithDescriptor}.${ext}`);
        images.push(url);
      }
    }

    if (images.length > 0) {
      colorGallery[color] = [...new Set(images)];
    }
  });

  return colorGallery;
};

/**
 * Get color-based gallery images for dual tone colors
 * Maps dual tone color combinations to images
 * 
 * Supports patterns like:
 * 1. {brand}_{model}_{variant}_{primary}_{secondary}.{jpg|png}
 * 2. {brand}_{model}_{primary}_{secondary}.{jpg|png}
 * 
 * @param brand - Brand name
 * @param model - Model name
 * @param variant - Variant name
 * @param dualToneColors - Array of dual tone color objects with name, primary, secondary
 * @param galleryUrls - Optional array of pre-uploaded gallery image URLs
 * @returns Object mapping color name -> array of image URLs
 */
export const getDualToneColorImageGallery = (
  brand: string,
  model: string,
  variant: string,
  dualToneColors: Array<{ name: string; primary: string; secondary: string }>,
  galleryUrls: string[] = []
): Record<string, string[]> => {
  const brandSlug = brand.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  const modelSlug = model.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  const variantSlug = variant.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  
  // Create alternative model slug without underscores for flexible matching
  const modelSlugNoUnderscore = modelSlug.replace(/_/g, "");

  const colorGallery: Record<string, string[]> = {};

  console.log("🎨 Dual Tone Color Image Gallery Debug - Setup:", {
    brand: brandSlug,
    model: modelSlug,
    variant: variantSlug,
    dualToneColors: dualToneColors.map(c => ({ name: c.name, primary: c.primary, secondary: c.secondary })),
    galleryUrlsCount: galleryUrls?.length || 0,
    galleryUrlsSample: galleryUrls?.slice(0, 10) || [],
    allGalleryFilenames: galleryUrls?.map(url => {
      const parts = url.split("/");
      return parts[parts.length - 1]?.toLowerCase() || url;
    }) || [],
  });

  if (galleryUrls && galleryUrls.length > 0) {
    dualToneColors.forEach((dualColor) => {
      // Normalize color names: lowercase and replace spaces/hyphens with underscores
      const primarySlug = dualColor.primary
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/-/g, "_");
      const secondarySlug = dualColor.secondary
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/-/g, "_");
      
      console.log(`\n🔍 [DUAL TONE: ${dualColor.name}]`);
      console.log(`   Primary: "${dualColor.primary}" -> "${primarySlug}"`);
      console.log(`   Secondary: "${dualColor.secondary}" -> "${secondarySlug}"`);
      
      // Pattern 1: {brand}_{model}_{variant}_{primary}_{secondary}
      const pattern1 = `${brandSlug}_${modelSlug}_${variantSlug}_${primarySlug}_${secondarySlug}`;
      
      // Pattern 2: {brand}_{model}_{primary}_{secondary} (no variant)
      const pattern2 = `${brandSlug}_${modelSlug}_${primarySlug}_${secondarySlug}`;
      
      // Handle common typos/variations (e.g., "galvano" vs "galvono")
      const secondaryVariations = [secondarySlug];
      if (secondarySlug.includes("galvano")) {
        secondaryVariations.push(secondarySlug.replace("galvano", "galvono"));
      } else if (secondarySlug.includes("galvono")) {
        secondaryVariations.push(secondarySlug.replace("galvono", "galvano"));
      }
      
      console.log(`   Looking for patterns:`);
      console.log(`     • ${pattern1}`);
      console.log(`     • ${pattern2}`);
      if (secondaryVariations.length > 1) {
        console.log(`   Checking secondary color variations:`, secondaryVariations);
      }
      
      const matchingImages = galleryUrls.filter((url) => {
        const fullPath = url.split("/");
        const filename = fullPath[fullPath.length - 1]?.toLowerCase() || "";
        
        // Remove file extension for cleaner matching
        const filenameNoExt = filename.replace(/\.(jpg|jpeg|png|webp)$/i, "");
        
        // Check all secondary color variations
        let matched = false;
        for (const secSlug of secondaryVariations) {
          const varPattern1 = `${brandSlug}_${modelSlug}_${variantSlug}_${primarySlug}_${secSlug}`;
          const varPattern2 = `${brandSlug}_${modelSlug}_${primarySlug}_${secSlug}`;
          const varPattern1Alt = `${brandSlug}_${modelSlugNoUnderscore}_${variantSlug}_${primarySlug}_${secSlug}`;
          const varPattern2Alt = `${brandSlug}_${modelSlugNoUnderscore}_${primarySlug}_${secSlug}`;
          
          const match1 = filenameNoExt === varPattern1 || filenameNoExt.includes(varPattern1);
          const match2 = filenameNoExt === varPattern2 || filenameNoExt.includes(varPattern2);
          const match1Alt = filenameNoExt === varPattern1Alt || filenameNoExt.includes(varPattern1Alt);
          const match2Alt = filenameNoExt === varPattern2Alt || filenameNoExt.includes(varPattern2Alt);
          
          if (match1 || match2 || match1Alt || match2Alt) {
            console.log(`  ✅ MATCHED: ${filename}`);
            if (match1) console.log(`     → Via Pattern1: ${varPattern1}${secSlug !== secondarySlug ? ' (variation)' : ''}`);
            if (match2) console.log(`     → Via Pattern2: ${varPattern2}${secSlug !== secondarySlug ? ' (variation)' : ''}`);
            if (match1Alt) console.log(`     → Via Pattern1Alt: ${varPattern1Alt}${secSlug !== secondarySlug ? ' (variation)' : ''}`);
            if (match2Alt) console.log(`     → Via Pattern2Alt: ${varPattern2Alt}${secSlug !== secondarySlug ? ' (variation)' : ''}`);
            matched = true;
            break;
          }
        }
        
        return matched;
      });

      if (matchingImages.length > 0) {
        colorGallery[dualColor.name] = matchingImages;
        console.log(`  ✅ TOTAL: Found ${matchingImages.length} image(s) for "${dualColor.name}"`);
      } else {
        console.log(`  ❌ NO MATCH for "${dualColor.name}"`);
        console.log(`     Available filenames in gallery:`, galleryUrls.map(url => url.split("/").pop()?.toLowerCase()));
      }
    });

    console.log("\n🎨 Final Dual Tone Color Gallery Mapping:", {
      colorsWithImages: Object.keys(colorGallery),
      mappingDetails: Object.entries(colorGallery).map(([color, images]) => ({ color, count: images.length })),
    });
    return colorGallery;
  }

  console.log("⚠️ No gallery URLs provided for dual tone colors - galleryUrls is empty or not provided");
  return colorGallery;
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
