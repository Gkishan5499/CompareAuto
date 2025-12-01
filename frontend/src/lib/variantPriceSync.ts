/**
 * Variant Price Synchronization Utility
 * Parses Excel data and updates variants.json with correct pricing
 */

import { dataCache } from "./data-cache";

export interface ExcelRow {
  brand: string;
  model: string;
  variant: string;
  price: number;
}

export interface SyncResult {
  updated: number;
  created: number;
  skipped: number;
  errors: string[];
  unknownBrands: Set<string>;
  unknownModels: Set<string>;
  updatedVariants: Array<{
    brand: string;
    model: string;
    variant: string;
    oldPrice: number;
    newPrice: number;
  }>;
}

// Brand normalization map
const BRAND_NORMALIZATIONS: Record<string, string> = {
  "maruti suzuki": "maruti-suzuki",
  "maruti": "maruti-suzuki",
  "hyundai": "hyundai",
  "tata": "tata",
  "tata motors": "tata",
  "mahindra": "mahindra",
  "kia": "kia",
  "honda": "honda",
  "toyota": "toyota",
  "mg": "mg",
  "mg motors": "mg",
  "mg motor": "mg",
  "renault": "renault",
  "nissan": "nissan",
  "ford": "ford",
  "volkswagen": "volkswagen",
  "volkeswagen": "volkswagen",
  "skoda": "skoda",
  "škoda": "skoda",
  "jeep": "jeep",
  "mercedes-benz": "mercedes-benz",
  "mercedes benz": "mercedes-benz",
  "bmw": "bmw",
  "audi": "audi",
  "lamborghini": "lamborghini",
  "lamborgini": "lamborghini",
  "land rover": "land-rover",
  "range rover": "land-rover",
  "citroen": "citroen",
  "citroën": "citroen",
};

// Model normalization map (handles common model name variations)
const MODEL_NORMALIZATIONS: Record<string, Record<string, string>> = {
  "maruti-suzuki": {
    "swift": "swift",
    "wagon r": "wagon-r",
    "wagonr": "wagon-r",
    "alto k10": "alto-k10",
    "dzire": "dzire",
    "brezza": "brezza",
    "ertiga": "ertiga",
    "celerio": "celerio",
    "s-presso": "s-presso",
    "s presso": "s-presso",
    "spresso": "s-presso",
    "eeco": "eeco",
    "vitara brezza": "brezza",
    "baleno": "baleno",
    "fronx": "fronx",
    "xl6": "xl6",
    "xl 6": "xl6",
    "ignis": "ignis",
    "grand vitara": "grand-vitara",
    "jimny": "jimny",
    "invicto": "invicto",
    "victoris": "grand-vitara", // Typo in Excel
  }
};

/**
 * Normalize brand name to slug
 */
export function normalizeBrandSlug(brandName: string): string {
  const normalized = brandName.toLowerCase().trim();
  return BRAND_NORMALIZATIONS[normalized] || normalized.replace(/\s+/g, "-");
}

/**
 * Normalize model name to slug
 */
export function normalizeModelSlug(brandSlug: string, modelName: string): string {
  const normalized = modelName.toLowerCase().trim();
  
  // Check brand-specific normalizations first
  if (MODEL_NORMALIZATIONS[brandSlug]?.[normalized]) {
    return MODEL_NORMALIZATIONS[brandSlug][normalized];
  }
  
  // Generic slug generation
  return normalized
    .replace(/\s+/g, "-")
    .replace(/[()]/g, "")
    .replace(/--+/g, "-");
}

/**
 * Normalize variant name to slug
 */
export function normalizeVariantSlug(variantName: string): string {
  return variantName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[()]/g, "")
    .replace(/--+/g, "-");
}

/**
 * Parse price from Excel format (₹1,234,567.00 or similar)
 */
export function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[₹,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? 0 : Math.round(num);
}

/**
 * Parse Excel data and return structured rows
 */
export function parseExcelData(rawData: string): ExcelRow[] {
  const rows: ExcelRow[] = [];
  const lines = rawData.split("\n");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("|Make|") || line.startsWith("|-|-")) continue;
    
    // Parse markdown table row
    const match = line.match(/\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/);
    if (match) {
      const brand = match[1].trim();
      const model = match[2].trim();
      const variant = match[3].trim();
      const price = parsePrice(match[4].trim());
      
      if (brand && model && variant && price > 0) {
        rows.push({ brand, model, variant, price });
      }
    }
  }
  
  return rows;
}

/**
 * Find or create variant in data
 */
export function syncVariantPrice(
  excelRow: ExcelRow,
  currentVariants: any[],
  result: SyncResult
): any | null {
  const brandSlug = normalizeBrandSlug(excelRow.brand);
  const modelSlug = normalizeModelSlug(brandSlug, excelRow.model);
  const variantSlug = normalizeVariantSlug(excelRow.variant);
  
  // Find brand
  const brand = dataCache.getBrands().find((b: any) => b.slug === brandSlug);
  if (!brand) {
    result.unknownBrands.add(excelRow.brand);
    return null;
  }
  
  // Find model
  const model = dataCache.getModels().find((m: any) => m.brandId === brand.id && m.slug === modelSlug);
  if (!model) {
    result.unknownModels.add(`${excelRow.brand} ${excelRow.model}`);
    return null;
  }
  
  // Find existing variant
  const existingIndex = currentVariants.findIndex(
    (v: any) => v.modelId === model.id && v.slug === variantSlug
  );
  
  if (existingIndex >= 0) {
    // Update existing variant
    const existing = currentVariants[existingIndex];
    if (existing.price !== excelRow.price) {
      result.updatedVariants.push({
        brand: excelRow.brand,
        model: excelRow.model,
        variant: excelRow.variant,
        oldPrice: existing.price,
        newPrice: excelRow.price,
      });
      currentVariants[existingIndex] = {
        ...existing,
        price: excelRow.price,
      };
      result.updated++;
    } else {
      result.skipped++;
    }
  } else {
    // Create new variant with placeholder specs
    const newVariant = {
      id: `${model.id}-${variantSlug}`,
      modelId: model.id,
      name: excelRow.variant,
      slug: variantSlug,
      price: excelRow.price,
      fuelType: "Petrol", // Placeholder
      transmission: "Manual", // Placeholder
      engine: "TBD",
      mileage: 0,
      seating: 5,
      colors: ["White", "Silver"],
    };
    currentVariants.push(newVariant);
    result.created++;
  }
  
  return null;
}

/**
 * Main sync function
 */
export function syncAllVariants(excelData: ExcelRow[]): SyncResult {
  const result: SyncResult = {
    updated: 0,
    created: 0,
    skipped: 0,
    errors: [],
    unknownBrands: new Set(),
    unknownModels: new Set(),
    updatedVariants: [],
  };
  
  const variants = [...dataCache.getVariants()];
  
  for (const row of excelData) {
    try {
      syncVariantPrice(row, variants, result);
    } catch (error) {
      result.errors.push(
        `Error syncing ${row.brand} ${row.model} ${row.variant}: ${error}`
      );
    }
  }
  
  return result;
}

/**
 * Generate change report
 */
export function generateChangeReport(result: SyncResult): string {
  const sections: string[] = [];
  
  sections.push(`# Variant Price Sync Report\n`);
  sections.push(`**Date**: ${new Date().toLocaleString()}\n`);
  sections.push(`## Summary\n`);
  sections.push(`- **Updated**: ${result.updated} variants`);
  sections.push(`- **Created**: ${result.created} new variants`);
  sections.push(`- **Skipped**: ${result.skipped} (no change)`);
  sections.push(`- **Errors**: ${result.errors.length}\n`);
  
  if (result.unknownBrands.size > 0) {
    sections.push(`## Unknown Brands (${result.unknownBrands.size})\n`);
    sections.push(Array.from(result.unknownBrands).map(b => `- ${b}`).join("\n"));
    sections.push("\n");
  }
  
  if (result.unknownModels.size > 0) {
    sections.push(`## Unknown Models (${result.unknownModels.size})\n`);
    sections.push(Array.from(result.unknownModels).map(m => `- ${m}`).join("\n"));
    sections.push("\n");
  }
  
  if (result.updatedVariants.length > 0) {
    sections.push(`## Price Updates (First 50)\n`);
    sections.push("| Brand | Model | Variant | Old Price | New Price |");
    sections.push("|-------|-------|---------|-----------|-----------|");
    result.updatedVariants.slice(0, 50).forEach(u => {
      sections.push(
        `| ${u.brand} | ${u.model} | ${u.variant} | ₹${u.oldPrice.toLocaleString()} | ₹${u.newPrice.toLocaleString()} |`
      );
    });
    sections.push("\n");
  }
  
  if (result.errors.length > 0) {
    sections.push(`## Errors\n`);
    result.errors.forEach(e => sections.push(`- ${e}`));
  }
  
  return sections.join("\n");
}
