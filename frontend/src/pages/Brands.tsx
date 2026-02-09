import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import BrandCard from "@/components/brands/BrandCard";
import { getBrands, getModelsByBrand } from "@/lib/data";
import { useBrands, useModelsByBrand } from "@/lib/api-hooks";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Search, CarFront, Zap, Crown, Mountain, Gauge, ArrowRight, FilterX } from "lucide-react";
import AdSlot from "@/components/ads/AdSlot";
import { getBrandLogo, getBrandInitial } from "@/lib/brandLogos";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility from shadcn

const Brands = () => {
  const { data: apiBrands, isLoading: brandsLoading } = useBrands();
  const fallbackBrands = getBrands();
  const brands = apiBrands || fallbackBrands;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedLetter, setSelectedLetter] = useState(searchParams.get("letter") || "All");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Map body types to icons for better visuals
  const bodyTypes = [
    { name: "Hatchback", icon: CarFront, color: "text-primary", bg: "bg-primary/10" },
    { name: "Sedan", icon: CarFront, color: "text-primary", bg: "bg-primary/10" },
    { name: "SUV", icon: Mountain, color: "text-primary", bg: "bg-primary/10" },
    { name: "MUV", icon: CarFront, color: "text-primary", bg: "bg-primary/10" },
    { name: "EV", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
    { name: "Luxury", icon: Crown, color: "text-primary", bg: "bg-primary/10" },
  ];

  // Spotlight logic
  const spotlightBrand = brands.find((b) => b.slug === "maruti-suzuki") || brands[0];
  const { data: apiSpotlightModels, isLoading: spotlightLoading } = useModelsByBrand(spotlightBrand?.slug || "");
  const fallbackSpotlightModels = spotlightBrand ? getModelsByBrand(spotlightBrand.slug) : [];
  const spotlightModels = apiSpotlightModels || fallbackSpotlightModels;
  const loading = brandsLoading || spotlightLoading;
  const spotlightLogo = spotlightBrand ? getBrandLogo(spotlightBrand.name) : null;
  const spotlightInitial = spotlightBrand ? getBrandInitial(spotlightBrand.name) : "";

  // Filter brands by search and letter
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLetter =
        selectedLetter === "All" || brand.name.charAt(0).toUpperCase() === selectedLetter;
      return matchesSearch && matchesLetter;
    });
  }, [brands, searchQuery, selectedLetter]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedLetter !== "All") params.set("letter", selectedLetter);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedLetter, setSearchParams]);

  // SEO
  useEffect(() => {
    updateMetaTags({
      title: "Car Brands in India – All Manufacturers",
      description: "Explore every car brand sold in India with models, prices, and variants. Compare specs and features by brand.",
      keywords: ["car brands india", "automobile manufacturers", "car companies"],
      canonical: `${window.location.origin}/brands`,
      ogImage: DEFAULT_OG_IMAGE,
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: brands.map((brand, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Brand",
          name: brand.name,
          url: `${window.location.origin}/${brand.slug}`,
        },
      })),
    };
    injectStructuredData(structuredData);
  }, [brands]);

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    document.getElementById("brand-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">Loading manufacturers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
      {/* 1) HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-slate-50 py-16 md:py-24">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-4 text-center z-10">
          <Badge className="mb-4 bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm px-4 py-1">
            {brands.length} Manufacturers Listed
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Find Your Dream Car Brand
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            From budget-friendly daily drivers to premium luxury cruisers. 
            Browse specs, compare models, and find the perfect match.
          </p>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12 opacity-80">
            <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold">{brands.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Brands</div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Models</div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold">EV</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Available</div>
            </div>
             <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Updated</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2) STICKY FILTER BAR */}
      <section className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search */}
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search by brand name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-muted/50 focus:bg-background transition-all border-muted-foreground/20"
                />
              </div>

              {/* A-Z Horizontal Scroll */}
              <div className="w-full md:w-auto overflow-hidden">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar mask-gradient-right">
                  <Button
                    variant={selectedLetter === "All" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleLetterClick("All")}
                    className="rounded-full px-4 h-8 text-xs font-medium"
                  >
                    All
                  </Button>
                  <div className="w-px h-6 bg-border mx-1 flex-shrink-0" />
                  {alphabet.map((letter) => (
                    <button
                      key={letter}
                      onClick={() => handleLetterClick(letter)}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all flex-shrink-0",
                        selectedLetter === letter 
                          ? "bg-primary text-primary-foreground shadow-md scale-110" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Slot */}
      <div className="container mx-auto px-4 mt-6">
        <AdSlot id="brands_top_leaderboard" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR (Desktop) / TOP SECTION (Mobile) */}
          <div className="lg:col-span-1 space-y-8">
             {/* Body Types Shortcuts */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Browse by Category
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {bodyTypes.map((type) => (
                  <Link key={type.name} to={`/body/${type.name.toLowerCase()}`}>
                    <div className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-md", type.bg, type.color)}>
                          <type.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium group-hover:text-primary transition-colors">{type.name}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-3">
            
            {/* 3) SPOTLIGHT BANNER */}
            {spotlightBrand && selectedLetter === "All" && !searchQuery && (
              <div className="mb-10 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl relative">
                <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="grid md:grid-cols-3 gap-6 p-6 md:p-8 relative z-10">
                  <div className="flex items-center justify-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center p-4 shadow-lg">
                       {spotlightLogo ? (
                        <img 
                          src={spotlightLogo} 
                          alt={spotlightBrand.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-4xl font-black text-slate-800">{spotlightInitial}</span>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-col justify-center text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                       <Badge variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90">
                         <Crown className="w-3 h-3 mr-1" /> Featured Brand
                       </Badge>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">{spotlightBrand.name}</h2>
                    <p className="text-muted-foreground mb-6 max-w-lg">
                      Discover why {spotlightBrand.name} remains a top choice in India. 
                      Featuring {spotlightModels.length} distinct models ranging from efficient hatchbacks to premium SUVs.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Link to={`/${spotlightBrand.slug}`}>
                        <Button size="lg" className="font-semibold shadow-lg shadow-primary/20">
                          View All Models
                        </Button>
                      </Link>
                      <Link to={`/${spotlightBrand.slug}#price`}>
                        <Button variant="outline" size="lg" className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white">
                           Price List
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4) BRAND GRID */}
            <section id="brand-grid" className="scroll-mt-24 min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  {selectedLetter !== "All" && <span className="text-primary">'{selectedLetter}'</span>}
                  Brands
                  <Badge variant="outline" className="ml-2">{filteredBrands.length}</Badge>
                </h2>
                
                {(searchQuery || selectedLetter !== "All") && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                       setSearchQuery("");
                       setSelectedLetter("All");
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <FilterX className="w-4 h-4 mr-2" /> Clear Filters
                  </Button>
                )}
              </div>

              {filteredBrands.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredBrands.map((brand) => (
                    <div key={brand.id} className="transform transition-all duration-300 hover:-translate-y-1">
                      <BrandCard brand={brand} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-dashed">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No brands found</h3>
                  <p className="text-muted-foreground text-center max-w-xs mb-6">
                    We couldn't find any brands matching "{searchQuery}" or starting with "{selectedLetter}".
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      handleLetterClick("All");
                    }}
                  >
                    Reset Search
                  </Button>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* 5) FAQ & SEO CONTENT */}
        <section className="mt-20 border-t pt-16">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mb-8">
                Everything you need to know about car manufacturers in India.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full bg-card rounded-xl border px-4">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="text-lg font-medium py-6 hover:no-underline hover:text-primary">
                  How many car brands are available in India?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  We currently list {brands.length}+ major car brands. The Indian market is diverse, featuring domestic giants like Tata and Mahindra, alongside international leaders like Hyundai, Toyota, and Kia.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-t">
                <AccordionTrigger className="text-lg font-medium py-6 hover:no-underline hover:text-primary">
                  Are luxury car brands included?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  Yes, our database includes all luxury manufacturers selling in India, including Mercedes-Benz, BMW, Audi, Volvo, and Jaguar, complete with their latest pricing and specifications.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-t">
                <AccordionTrigger className="text-lg font-medium py-6 hover:no-underline hover:text-primary">
                  Where do you get the price data?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                   Prices are updated based on official ex-showroom figures released by manufacturers. We strive to update these figures within 24-48 hours of any official price hike or new launch.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Bottom Ad */}
        <div className="mt-12">
          <AdSlot id="brands_bottom_billboard" />
        </div>
      </div>
    </div>
  );
};

export default Brands;