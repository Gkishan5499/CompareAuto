"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const brand_routes_1 = __importDefault(require("./routes/brand.routes"));
const article_routes_1 = __importDefault(require("./routes/article.routes"));
const comparison_routes_1 = __importDefault(require("./routes/comparison.routes"));
const dealer_routes_1 = __importDefault(require("./routes/dealer.routes"));
const carModel_routes_1 = __importDefault(require("./routes/carModel.routes"));
const variant_routes_1 = __importDefault(require("./routes/variant.routes"));
const electricityRate_routes_1 = __importDefault(require("./routes/electricityRate.routes"));
const featureFlag_routes_1 = __importDefault(require("./routes/featureFlag.routes"));
const fuelPrice_routes_1 = __importDefault(require("./routes/fuelPrice.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const upcomingCar_routes_1 = __importDefault(require("./routes/upcomingCar.routes"));
const usedCar_routes_1 = __importDefault(require("./routes/usedCar.routes"));
const mediaMap_routes_1 = __importDefault(require("./routes/mediaMap.routes"));
const city_routes_1 = __importDefault(require("./routes/city.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const filter_routes_1 = __importDefault(require("./routes/filter.routes"));
const popular_routes_1 = __importDefault(require("./routes/popular.routes"));
const stateTaxConfig_routes_1 = __importDefault(require("./routes/stateTaxConfig.routes"));
const pricing_admin_routes_1 = __importDefault(require("./routes/pricing.admin.routes"));
const pricing_routes_1 = __importDefault(require("./routes/pricing.routes"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const specs_routes_1 = __importDefault(require("./routes/specs.routes"));
const specsCSV_routes_1 = __importDefault(require("./routes/specsCSV.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigins = ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(",").map((s) => s.trim()).filter(Boolean)) || [];
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        // allow non-browser clients (e.g. curl, Postman)
        if (!origin)
            return cb(null, true);
        // Allow any localhost / 127.0.0.1 origin to ease development across ports
        try {
            const url = new URL(origin);
            if (url.hostname === "localhost" || url.hostname === "127.0.0.1")
                return cb(null, true);
        }
        catch (err) {
            // if cannot parse, fallthrough to includes check
        }
        if (allowedOrigins.includes(origin))
            return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Backend is running...");
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/uploads", upload_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
// register specs csv upload route (admin-only)
app.use("/api/specs-csv", specsCSV_routes_1.default);
// Admin pricing and tax management
app.use("/api/admin/pricing", pricing_admin_routes_1.default);
// Public pricing helpers
app.use("/api/pricing", pricing_routes_1.default);
app.use("/api/brands", brand_routes_1.default);
app.use("/api/articles", article_routes_1.default);
app.use("/api/comparisons", comparison_routes_1.default);
app.use("/api/dealers", dealer_routes_1.default);
app.use("/api/models", carModel_routes_1.default);
app.use("/api/variants", variant_routes_1.default);
app.use("/api/electricity-rates", electricityRate_routes_1.default);
app.use("/api/feature-flags", featureFlag_routes_1.default);
app.use("/api/fuel-prices", fuelPrice_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/upcoming-cars", upcomingCar_routes_1.default);
app.use("/api/used-cars", usedCar_routes_1.default);
app.use("/api/media-map", mediaMap_routes_1.default);
app.use("/api/cities", city_routes_1.default);
app.use("/api/search", search_routes_1.default);
app.use("/api/filters", filter_routes_1.default);
app.use("/api/popular", popular_routes_1.default);
app.use("/api/state-tax-config", stateTaxConfig_routes_1.default);
app.use("/api/specs", specs_routes_1.default);
// Serve static images
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "..", "public")));
exports.default = app;
