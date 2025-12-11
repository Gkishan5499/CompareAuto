import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import brandRoutes from "./routes/brand.routes";
import articleRoutes from "./routes/article.routes";
import comparisonRoutes from "./routes/comparison.routes";
import dealerRoutes from "./routes/dealer.routes";
import carModelRoutes from "./routes/carModel.routes";
import variantRoutes from "./routes/variant.routes";
import electricityRateRoutes from "./routes/electricityRate.routes";
import featureFlagRoutes from "./routes/featureFlag.routes";
import fuelPriceRoutes from "./routes/fuelPrice.routes";
import reviewRoutes from "./routes/review.routes";
import upcomingCarRoutes from "./routes/upcomingCar.routes";
import usedCarRoutes from "./routes/usedCar.routes";
import mediaMapRoutes from "./routes/mediaMap.routes";
import cityRoutes from "./routes/city.routes";
import searchRoutes from "./routes/search.routes";
import filterRoutes from "./routes/filter.routes";
import popularRoutes from "./routes/popular.routes";
import stateTaxConfigRoutes from "./routes/stateTaxConfig.routes";
import pricingAdminRoutes from "./routes/pricing.admin.routes";
import pricingRoutes from "./routes/pricing.routes";
import path from "path";
import authRoutes from "./routes/auth.routes";
import uploadRoutes from "./routes/upload.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import specsRoutes from "./routes/specs.routes";
import specsCsvRoutes from "./routes/specsCSV.routes";
import heroCarouselRoutes from "./routes/heroCarousel.routes";






dotenv.config();

const app = express();



const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",")
  .map((s) => s.trim())
  .filter(Boolean) || [];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser clients (e.g. curl, Postman)
      if (!origin) return cb(null, true);

      // Allow any localhost / 127.0.0.1 origin to ease development across ports
      try {
        const url = new URL(origin);
        if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return cb(null, true);
      } catch (err) {
        // if cannot parse, fallthrough to includes check
      }

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
// register specs csv upload route (admin-only)
app.use("/api/specs-csv", specsCsvRoutes);
// Admin pricing and tax management
app.use("/api/admin/pricing", pricingAdminRoutes);
// Public pricing helpers
app.use("/api/pricing", pricingRoutes);

app.use("/api/brands", brandRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/comparisons", comparisonRoutes);
app.use("/api/dealers", dealerRoutes);
app.use("/api/models", carModelRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/electricity-rates", electricityRateRoutes);
app.use("/api/feature-flags", featureFlagRoutes);
app.use("/api/fuel-prices", fuelPriceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upcoming-cars", upcomingCarRoutes);
app.use("/api/used-cars", usedCarRoutes);
app.use("/api/media-map", mediaMapRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/filters", filterRoutes);
app.use("/api/popular", popularRoutes);
app.use("/api/state-tax-config", stateTaxConfigRoutes);
app.use("/api/specs", specsRoutes);
app.use("/api/hero-carousel", heroCarouselRoutes);


// Serve static images
app.use("/public", express.static(path.join(__dirname, "..", "public")));



export default app;
