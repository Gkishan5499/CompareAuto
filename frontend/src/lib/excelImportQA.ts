/**
 * Excel Import QA Utility
 * Performs dry-run comparison between Excel data and site variants
 */

import { dataCache } from "./data-cache";

export interface ExcelRowParsed {
  brand: string;
  model: string;
  variant: string;
  exShowroom: number;
  rawPrice: string;
  lineNumber: number;
}

export interface QAMatch {
  brand: string;
  model: string;
  variant: string;
  excelPrice: number;
  sitePrice: number;
  priceDiff: number;
  variantId: string;
}

export interface QAMissing {
  brand: string;
  model: string;
  variant: string;
  excelPrice: number;
  reason: "variant_not_found" | "model_not_found" | "brand_not_found";
}

export interface QADuplicate {
  brand: string;
  model: string;
  variant: string;
  count: number;
  prices: number[];
}

export interface QAReport {
  sheetTotal: number;
  foundInSite: number;
  missingInSite: number;
  duplicatesInSheet: number;
  priceMismatchCount: number;
  unknownBrandsOrModels: number;
  
  matches: QAMatch[];
  missingVariants: QAMissing[];
  duplicates: QADuplicate[];
  priceMismatches: QAMatch[];
}

// Brand normalization map
const BRAND_NORMALIZATIONS: Record<string, string> = {
  "maruti suzuki": "maruti-suzuki",
  "maruti": "maruti-suzuki",
  "hyundai": "hyundai",
  "tata": "tata-motors",
  "tata motors": "tata-motors",
  "mahindra": "mahindra",
  "kia": "kia",
  "honda": "honda",
  "toyota": "toyota",
  "mg": "mg-motor",
  "mg motors": "mg-motor",
  "mg motor": "mg-motor",
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
  "nexa": "nexa",
  "byd": "byd",
  "isuzu": "isuzu",
  "vinfast": "vinfast",
  "volvo": "volvo",
  "lexus": "lexus",
  "jaguar": "jaguar",
  "porsche": "porsche",
  "ferrari": "ferrari",
  "maserati": "maserati",
  "rolls-royce": "rolls-royce",
  "rolls royce": "rolls-royce",
  "bentley": "bentley",
  "mini": "mini",
  "aston martin": "aston-martin",
  "aston-martin": "aston-martin",
  "tesla": "tesla",
  "bajaj": "bajaj",
  "storm motors": "storm-motors",
  "mclaren": "mclaren",
  "pmv electric": "pmv-electric",
  "lotus": "lotus",
};

/**
 * Normalize brand name to slug
 */
function normalizeBrandSlug(brandName: string): string {
  const normalized = brandName.toLowerCase().trim();
  return BRAND_NORMALIZATIONS[normalized] || normalized.replace(/\s+/g, "-");
}

/**
 * Normalize model name to slug
 */
function normalizeModelSlug(modelName: string): string {
  return modelName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[():]/g, "")
    .replace(/--+/g, "-");
}

/**
 * Normalize variant name to slug
 */
function normalizeVariantSlug(variantName: string): string {
  return variantName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[():]/g, "")
    .replace(/--+/g, "-")
    .replace(/\//g, "-");
}

/**
 * Parse price from Excel format
 */
function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[₹,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? 0 : Math.round(num);
}

/**
 * Parse Excel markdown table data
 */
export function parseExcelMarkdown(rawData: string): ExcelRowParsed[] {
  const rows: ExcelRowParsed[] = [];
  const lines = rawData.split("\n");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("|Make|") || line.startsWith("|-|-") || line.startsWith("## Page")) continue;
    
    // Parse markdown table row: |Brand|Model|Variant|Price|
    const match = line.match(/\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|?/);
    if (match) {
      const brand = match[1].trim();
      const model = match[2].trim();
      const variant = match[3].trim();
      const rawPrice = match[4].trim();
      const price = parsePrice(rawPrice);
      
      if (brand && model && variant && price > 0) {
        rows.push({
          brand,
          model,
          variant,
          exShowroom: price,
          rawPrice,
          lineNumber: i + 1,
        });
      }
    }
  }
  
  return rows;
}

/**
 * Find variant in site data
 */
function findVariantInSite(
  brandSlug: string,
  modelSlug: string,
  variantSlug: string
): { found: boolean; variant?: any; reason?: string } {
  // Find brand
  const brand = dataCache.getBrands().find((b: any) => b.slug === brandSlug);
  if (!brand) {
    return { found: false, reason: "brand_not_found" };
  }
  
  // Find model
  const model = dataCache.getModels().find(
    (m: any) => m.brandId === brand.id && m.slug === modelSlug
  );
  if (!model) {
    return { found: false, reason: "model_not_found" };
  }
  
  // Find variant
  const variant = dataCache.getVariants().find(
    (v: any) => v.modelId === model.id && v.slug === variantSlug
  );
  if (!variant) {
    return { found: false, reason: "variant_not_found" };
  }
  
  return { found: true, variant };
}

/**
 * Detect duplicates in Excel data
 */
function detectDuplicates(rows: ExcelRowParsed[]): QADuplicate[] {
  const keyMap = new Map<string, { count: number; prices: number[]; data: ExcelRowParsed }>();
  
  for (const row of rows) {
    const brandSlug = normalizeBrandSlug(row.brand);
    const modelSlug = normalizeModelSlug(row.model);
    const variantSlug = normalizeVariantSlug(row.variant);
    const key = `${brandSlug}::${modelSlug}::${variantSlug}`;
    
    if (keyMap.has(key)) {
      const entry = keyMap.get(key)!;
      entry.count++;
      entry.prices.push(row.exShowroom);
    } else {
      keyMap.set(key, {
        count: 1,
        prices: [row.exShowroom],
        data: row,
      });
    }
  }
  
  const duplicates: QADuplicate[] = [];
  for (const [key, value] of keyMap.entries()) {
    if (value.count > 1) {
      duplicates.push({
        brand: value.data.brand,
        model: value.data.model,
        variant: value.data.variant,
        count: value.count,
        prices: value.prices,
      });
    }
  }
  
  return duplicates;
}

/**
 * Run comprehensive QA analysis
 */
export function runQAAnalysis(excelData: ExcelRowParsed[]): QAReport {
  const matches: QAMatch[] = [];
  const missingVariants: QAMissing[] = [];
  const priceMismatchList: QAMatch[] = [];
  
  // Detect duplicates first
  const duplicates = detectDuplicates(excelData);
  
  // Process each row
  for (const row of excelData) {
    const brandSlug = normalizeBrandSlug(row.brand);
    const modelSlug = normalizeModelSlug(row.model);
    const variantSlug = normalizeVariantSlug(row.variant);
    
    const result = findVariantInSite(brandSlug, modelSlug, variantSlug);
    
    if (result.found && result.variant) {
      const sitePrice = result.variant.price || 0;
      const priceDiff = Math.abs(row.exShowroom - sitePrice);
      
      const matchData: QAMatch = {
        brand: row.brand,
        model: row.model,
        variant: row.variant,
        excelPrice: row.exShowroom,
        sitePrice,
        priceDiff,
        variantId: result.variant.id,
      };
      
      matches.push(matchData);
      
      // Check for price mismatch (tolerance: ₹1000)
      if (priceDiff > 1000) {
        priceMismatchList.push(matchData);
      }
    } else {
      missingVariants.push({
        brand: row.brand,
        model: row.model,
        variant: row.variant,
        excelPrice: row.exShowroom,
        reason: result.reason as any,
      });
    }
  }
  
  // Count unknown brands/models
  const unknownBrandsOrModels = missingVariants.filter(
    (m) => m.reason === "brand_not_found" || m.reason === "model_not_found"
  ).length;
  
  return {
    sheetTotal: excelData.length,
    foundInSite: matches.length,
    missingInSite: missingVariants.length,
    duplicatesInSheet: duplicates.length,
    priceMismatchCount: priceMismatchList.length,
    unknownBrandsOrModels,
    matches,
    missingVariants,
    duplicates,
    priceMismatches: priceMismatchList,
  };
}

/**
 * Generate CSV for download
 */
export function generateCSV(data: any[], columns: string[]): string {
  const header = columns.join(",");
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col] ?? "";
      // Escape commas and quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(",")
  );
  return [header, ...rows].join("\n");
}
