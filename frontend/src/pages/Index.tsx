import { useEffect, Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { updateMetaTags, injectStructuredData, generateOrganizationSchema, DEFAULT_OG_IMAGE } from "@/lib/seo";
import HeroSearch from "@/components/home/HeroSearch";
const BodyTypesStrip = lazy(() => import("@/components/home/BodyTypesStrip"));
const FuelTypeStrip = lazy(() => import("@/components/home/FuelTypeStrip"));
const TopPicks = lazy(() => import("@/components/home/TopPicks"));
const RecentModelsSlider = lazy(() => import("@/components/home/RecentModelsSlider"));
const UpcomingTimeline = lazy(() => import("@/components/home/UpcomingTimeline"));
const BrandsStrip = lazy(() => import("@/components/home/BrandsStrip"));
const QuickToolsRibbon = lazy(() => import("@/components/home/QuickToolsRibbon"));
import CompareBar from "@/components/home/CompareBar";
import AdSlot from "@/components/ads/AdSlot";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load non-critical sections to improve Initial Load Time (LCP)
const TrendingComparisons = lazy(() => import("@/components/home/TrendingComparisons"));
const LatestNews = lazy(() => import("@/components/home/LatestNews"));
const ExploreBodyTypes = lazy(() => import("@/components/home/ExploreBodyTypes"));
const WhyCompareAuto = lazy(() => import("@/components/home/WhyCompareAuto"));

const Index = () => {
  useEffect(() => {
    // 1. Update Meta Tags
    updateMetaTags({
      title: "CompareAuto.in – Variant-wise Car Comparison & Prices in India",
      description: "The most comprehensive car comparison tool in India. Compare variants, check on-road prices, EMI, specs, and features across all brands.",
      keywords: [
        "compare cars india", "car prices", "variant comparison", "on road price", 
        "EMI calculator", "car specifications", "best mileage cars", "suv under 10 lakhs"
      ],
      canonical: "https://compareauto.in/",
      ogImage: DEFAULT_OG_IMAGE,
    });

    // 2. Inject Organization Schema
    const orgSchema = generateOrganizationSchema();
    injectStructuredData(orgSchema);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground overflow-x-hidden">
      <main className="flex flex-col gap-8 sm:gap-10 lg:gap-12">
        {/* 1. HERO SECTION (Critical LCP) */}
        <HeroSearch />

        {/* Ad Slot: Top Leaderboard */}
        <section className="w-full bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-4 max-w-7xl py-4 sm:py-5">
            <AdSlot
              id="home_top_leaderboard"
              sizeMap={{ desktop: "728x90", tablet: "468x60", mobile: "320x50" }}
            />
          </div>
        </section>

        {/* Recent and Upcoming sections stacked with tighter mobile spacing */}
        <div className="flex flex-col gap-8 sm:gap-10">
          <Suspense fallback={<SectionLoader label="Loading recent models..." />}>
            <RecentModelsSlider />
          </Suspense>
          <Suspense fallback={<SectionLoader label="Loading upcoming cars..." />}>
            <UpcomingTimeline />
          </Suspense>
          <Suspense fallback={<SectionLoader label="Loading comparisons..." />}>
            <TrendingComparisons />
          </Suspense>
        </div>


        {/* 2. DISCOVERY STRIPS */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <Suspense fallback={<SectionLoader label="Loading body types..." />}> 
            <ExploreBodyTypes />
          </Suspense>
          <Suspense fallback={<SectionLoader label="Loading fuel types..." />}> 
            <FuelTypeStrip />
          </Suspense>
        </div>

        {/* 3. EDITORIAL & RANKINGS */}
        <Suspense fallback={<SectionLoader label="Loading top picks..." />}> 
          <TopPicks />
        </Suspense>

        {/* Ad Slot: Mid Billboard (High Visibility) */}
        <section className="py-6 sm:py-8 bg-muted/20 border-y border-dashed border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 max-w-7xl text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 block">Sponsored</span>
            <AdSlot
              id="home_mid_billboard"
              sizeMap={{ desktop: "970x250", tablet: "728x90", mobile: "320x100" }}
            />
          </div>
        </section>

        <section className="border-t border-slate-100 dark:border-slate-800">
          <Suspense fallback={<SectionLoader label="Loading brands..." />}> 
            <BrandsStrip />
          </Suspense>
        </section>

        {/* 5. LAZY LOADED SECTIONS (Performance Optimization) */}
        <Suspense fallback={<SectionLoader label="Loading highlights..." />}>
          <div className="flex flex-col gap-8 sm:gap-10">
            <LatestNews />
            <QuickToolsRibbon />
            <div className="bg-slate-50 dark:bg-slate-950/50">
              <WhyCompareAuto />
            </div>
          </div>
        </Suspense>
      </main>

      {/* Sticky Compare Bar (Always visible if items selected) */}
      <CompareBar />
    </div>
  );
};

// Simple Skeleton for lazy sections
const SectionSkeleton = () => (
  <div className="container mx-auto px-4 max-w-7xl py-12 sm:py-16 space-y-6 sm:space-y-8">
    <Skeleton className="h-8 w-1/3 mx-auto" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  </div>
);

const SectionLoader = ({ label }: { label: string }) => (
  <div className="container mx-auto px-4 max-w-7xl py-12 sm:py-16">
    <div className="h-48 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-muted/20 flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  </div>
);

export default Index;