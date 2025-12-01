import { useEffect, Suspense, lazy } from "react";
import { updateMetaTags, injectStructuredData, generateOrganizationSchema, DEFAULT_OG_IMAGE } from "@/lib/seo";
import HeroSearch from "@/components/home/HeroSearch";
import BodyTypesStrip from "@/components/home/BodyTypesStrip";
import FuelTypeStrip from "@/components/home/FuelTypeStrip";
import TopPicks from "@/components/home/TopPicks";
import NewLaunches from "@/components/home/NewLaunches";
import BrandsStrip from "@/components/home/BrandsStrip";
import QuickToolsRibbon from "@/components/home/QuickToolsRibbon";
import CompareBar from "@/components/home/CompareBar";
import AdSlot from "@/components/ads/AdSlot";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load non-critical sections to improve Initial Load Time (LCP)
const UpcomingTimeline = lazy(() => import("@/components/home/UpcomingTimeline"));
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
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      
      {/* 1. HERO SECTION (Critical LCP) */}
      <HeroSearch />

      {/* Ad Slot: Top Leaderboard */}
      <div className="w-full bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <AdSlot 
            id="home_top_leaderboard" 
            sizeMap={{ desktop: "728x90", tablet: "468x60", mobile: "320x50" }} 
          />
        </div>
      </div>

      {/* 2. DISCOVERY STRIPS */}
      <div className="flex flex-col">
        {/* Body Types */}
        <BodyTypesStrip />
        
        {/* Fuel Types */}
        <FuelTypeStrip />
      </div>

      {/* 3. EDITORIAL & RANKINGS */}
      <TopPicks />

      {/* Ad Slot: Mid Billboard (High Visibility) */}
      {/* <section className="py-8 bg-muted/20 border-y border-dashed border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 block">Sponsored</span>
          <AdSlot 
            id="home_mid_billboard" 
            sizeMap={{ desktop: "970x250", tablet: "728x90", mobile: "320x100" }} 
          />
        </div>
      </section> */}

      {/* 4. NEW & TRENDING */}
      <NewLaunches />

      <section className="border-t border-slate-100 dark:border-slate-800">
        <BrandsStrip />
      </section>

      {/* 5. LAZY LOADED SECTIONS (Performance Optimization) */}
      <Suspense fallback={<SectionSkeleton />}>
        
        <UpcomingTimeline />
        
        <TrendingComparisons />
        
        <LatestNews />
        
        <QuickToolsRibbon />
        
        {/* SEO Content Blocks */}
        <div className="bg-slate-50 dark:bg-slate-950/50">
          <ExploreBodyTypes />
          <WhyCompareAuto />
        </div>

      </Suspense>

      {/* Sticky Compare Bar (Always visible if items selected) */}
      <CompareBar />
    </div>
  );
};

// Simple Skeleton for lazy sections
const SectionSkeleton = () => (
  <div className="container mx-auto px-4 py-16 space-y-8">
    <Skeleton className="h-8 w-1/3 mx-auto" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  </div>
);

export default Index;