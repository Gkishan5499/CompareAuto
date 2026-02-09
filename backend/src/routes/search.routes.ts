import express from "express";
import { Request, Response } from "express";

const router = express.Router();

// Search cars by query
router.get("/cars", async (req: Request, res: Response) => {
  try {
    const { q, brand, bodyType, fuelType, priceMin, priceMax, city } = req.query;
    
    // This would typically query your database
    // For now, returning a structure
    const results = {
      query: q,
      filters: {
        brand,
        bodyType,
        fuelType,
        priceMin,
        priceMax,
        city,
      },
      results: [], // Would be populated from database
      total: 0,
    };
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

// Get search suggestions
router.get("/suggestions", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== "string") {
      return res.json([]);
    }
    
    const query = q.toLowerCase().trim();
    
    // Import models
    const Brand = require("../models/Brand.model").default;
    const CarModel = require("../models/CarModel.model").default;
    const Variant = require("../models/Variant.model").default;
    
    const suggestions: any[] = [];
    
    // Search brands
    const brands = await Brand.find({ 
      name: { $regex: query, $options: "i" } 
    }).limit(5).lean();
    
    // Add "All [Brand] Cars" option if brand matches
    if (brands.length > 0) {
      brands.forEach((brand: any) => {
        suggestions.push({
          type: "brand",
          id: brand.id,
          name: `All ${brand.name} Cars`,
          displayName: brand.name,
          slug: brand.slug,
          brandSlug: brand.slug,
          category: "Brand"
        });
      });
    }
    
    // Search models
    const models = await CarModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brandName: { $regex: query, $options: "i" } }
      ]
    })
    .limit(10)
    .lean();
    
    // Add models with brand name
    for (const model of models) {
      const brand = await Brand.findOne({ id: model.brandId }).lean();
      const brandName = brand?.name || model.brandName || "";
      
      suggestions.push({
        type: "model",
        id: model.id,
        name: `${brandName} ${model.name}`,
        displayName: model.name,
        brandName: brandName,
        slug: model.slug,
        brandSlug: brand?.slug || brandName.toLowerCase().replace(/\s+/g, "-"),
        category: "Model",
        bodyType: model.bodyType
      });
    }
    
    // Search variants
    const variants = await Variant.find({
      name: { $regex: query, $options: "i" }
    })
    .limit(8)
    .lean();
    
    // Add variants with model and brand name
    for (const variant of variants) {
      const model = await CarModel.findOne({ id: variant.modelId }).lean();
      if (model) {
        const brand = await Brand.findOne({ id: model.brandId }).lean();
        const brandName = brand?.name || model.brandName || "";
        
        suggestions.push({
          type: "variant",
          id: variant.id,
          name: `${brandName} ${model.name} ${variant.name}`,
          displayName: variant.name,
          modelName: model.name,
          brandName: brandName,
          slug: variant.slug,
          modelSlug: model.slug,
          brandSlug: brand?.slug || brandName.toLowerCase().replace(/\s+/g, "-"),
          category: "Variant"
        });
      }
    }
    
    // Remove duplicates and limit
    const uniqueSuggestions = suggestions
      .filter((item, index, self) => 
        index === self.findIndex(t => t.name === item.name)
      )
      .slice(0, 10);
    
    res.json(uniqueSuggestions);
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

// Get popular searches
router.get("/popular", (req: Request, res: Response) => {
  try {
    const popularSearches = [
      { term: "SUV", count: 12500, type: "bodyType" },
      { term: "Hyundai Creta", count: 8900, type: "model" },
      { term: "Electric Cars", count: 6700, type: "fuelType" },
      { term: "Maruti Swift", count: 5400, type: "model" },
      { term: "Under 10 Lakh", count: 4800, type: "price" },
      { term: "Tata Nexon", count: 4200, type: "model" },
      { term: "Sedan", count: 3800, type: "bodyType" },
      { term: "Mahindra Thar", count: 3500, type: "model" },
    ];
    
    res.json(popularSearches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch popular searches" });
  }
});

export default router;

