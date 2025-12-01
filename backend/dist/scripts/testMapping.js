"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csvMapping_1 = require("../utils/csvMapping");
const sampleRow = {
    brand: "Test Brand",
    model: "Test Model",
    variant: "Test Var",
    variant_id: "test-var-1",
    ex_showroom_price: "1250000",
    engine_cc: "1462",
    electric_motor: "85 hp",
    fuel_type: "Petrol",
    ambient_interior_lighting: "Yes",
    remote_engine_start_stop: "Yes",
    average_fuel_consumption: "15.3",
    headlights_raw: "LED",
    hero: "/images/xhero.png",
    gallery: "/images/x1.jpg;/images/x2.jpg",
    "Custom Field": "Some value",
};
const mapping = {
    brand: "brand",
    model: "model",
    variant: "variant",
    variant_id: "variant_id",
    ex_showroom_price: "overview.price",
    ambient_interior_lighting: "ambient_interior_lighting",
    remote_engine_start_stop: "remote_engine_start_stop",
    average_fuel_consumption: "average_fuel_consumption",
    engine_cc: "engine.engine_cc",
    electric_motor: "engine.motor",
    fuel_type: "variant.fuelType",
    headlights_raw: "lighting.headlamps",
    hero: "media.hero",
    gallery: "media.gallery",
    "Custom Field": "custom_field"
};
console.log(JSON.stringify((0, csvMapping_1.mapRowToSpecs)(sampleRow, mapping), null, 2));
