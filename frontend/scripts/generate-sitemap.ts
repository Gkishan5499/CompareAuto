import { writeFileSync, readFileSync } from "fs";
import path from "path";
import { SitemapStream, streamToPromise } from "sitemap";
import { getBodyTypeSlugs } from "../src/lib/bodyTypes";

const SITE_URL = process.env.SITE_URL || "https://www.compareauto.in";
const API_BASE_URL = process.env.SITEMAP_API_URL || process.env.VITE_API_URL || `${SITE_URL}/api`;

const staticRoutes = [
  "/",
  "/brands",
  "/new-cars",
  "/compare",
  "/used-cars",
  "/news",
  "/contact",
  "/about",
  "/faq",
  "/tools",
  "/fuel",
  "/body",
  "/upcoming-cars",
  "/dealers",
  "/terms-condition",
  "/privacy-policy",
];

const fuelTypeRoutes = ["ev", "hybrid", "cng", "petrol", "diesel"].map(
  (slug) => `/fuel/${slug}`
);

const bodyTypeRoutes = getBodyTypeSlugs().map((slug) => `/body/${slug}`);

type Brand = { id: string; slug: string };
type Model = { id: string; slug: string; brandId: string };
type Variant = { id: string; slug: string; modelId: string };
type Article = { slug?: string };
type Dealer = { id?: string };
type UsedCar = { listingUrl?: string; city?: string; id?: string };

const kebab = (value?: string) =>
  (value || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const addRoute = (set: Set<string>, route?: string | null) => {
  if (!route) return;
  const normalized = route.startsWith("/") ? route : `/${route}`;
  set.add(normalized);
};

const fetchJson = async <T,>(endpoint: string): Promise<T | null> => {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`⚠️ Failed to fetch ${endpoint}`, error);
    return null;
  }
};

const getDynamicPages = (): string[] => {
  try {
    const pagesPath = path.resolve(__dirname, "../src/data/pages.json");
    const raw = readFileSync(pagesPath, "utf-8");
    const data = JSON.parse(raw) as { routes?: Array<{ path: string }> };
    return (data.routes || []).map((route) => route.path).filter(Boolean);
  } catch (error) {
    console.warn("⚠️ Failed to read pages.json", error);
    return [];
  }
};

async function generateSitemap() {
  const routes = new Set<string>();
  staticRoutes.forEach((route) => addRoute(routes, route));
  fuelTypeRoutes.forEach((route) => addRoute(routes, route));
  bodyTypeRoutes.forEach((route) => addRoute(routes, route));
  getDynamicPages().forEach((route) => addRoute(routes, route));

  const [brands, models, variants, articles, dealers, usedCars] = await Promise.all([
    fetchJson<Brand[]>(`${API_BASE_URL}/brands`),
    fetchJson<Model[]>(`${API_BASE_URL}/models`),
    fetchJson<Variant[]>(`${API_BASE_URL}/variants`),
    fetchJson<Article[]>(`${API_BASE_URL}/articles`),
    fetchJson<Dealer[]>(`${API_BASE_URL}/dealers`),
    fetchJson<UsedCar[]>(`${API_BASE_URL}/used-cars`),
  ]);

  const brandList = brands || [];
  const modelList = models || [];
  const variantList = variants || [];

  const brandById = new Map(brandList.map((brand) => [brand.id, brand.slug]));
  const modelById = new Map(modelList.map((model) => [model.id, model]));

  brandList.forEach((brand) => addRoute(routes, `/${brand.slug}`));

  modelList.forEach((model) => {
    const brandSlug = brandById.get(model.brandId);
    if (!brandSlug) return;
    addRoute(routes, `/${brandSlug}/${model.slug}`);
  });

  variantList.forEach((variant) => {
    const model = modelById.get(variant.modelId);
    if (!model) return;
    const brandSlug = brandById.get(model.brandId);
    if (!brandSlug) return;
    addRoute(routes, `/${brandSlug}/${model.slug}/${variant.slug}`);
  });

  (articles || []).forEach((article) => addRoute(routes, article.slug ? `/news/${article.slug}` : null));
  (dealers || []).forEach((dealer) => addRoute(routes, dealer.id ? `/dealers/${dealer.id}` : null));

  (usedCars || []).forEach((car) => {
    if (car.listingUrl) {
      addRoute(routes, car.listingUrl);
      return;
    }
    const citySlug = kebab(car.city);
    if (citySlug && car.id) {
      addRoute(routes, `/used-cars/${citySlug}/${car.id.toLowerCase()}`);
    }
  });

  const sitemap = new SitemapStream({ hostname: SITE_URL });

  Array.from(routes).forEach((route) => {
    sitemap.write({
      url: route,
      changefreq: "weekly",
      priority: 0.8,
    });
  });

  sitemap.end();

  const sitemapData = await streamToPromise(sitemap);

  writeFileSync("./public/sitemap.xml", sitemapData.toString());

  console.log("✅ sitemap.xml generated successfully");
}

generateSitemap().catch((error) => {
  console.error("❌ Failed to generate sitemap", error);
  process.exit(1);
});
