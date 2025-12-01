import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Car, Zap, Users, ShieldCheck, Sparkles, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useBrands } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";

// Images
import carfirst from "@/assets/hero/car1.jpg";
import carsecond from "@/assets/hero/car2.jpg";
import carthird from "@/assets/hero/car3.jpg";
import carfourth from "@/assets/hero/car4.jpg";

const BODY_TYPES = ["Hatchback", "Sedan", "SUV", "MUV", "Luxury", "Convertible"];

const PRICE_RANGES = [
  { label: "Under ₹5 Lakh", value: "0-500000" },
  { label: "₹5 - ₹10 Lakh", value: "500000-1000000" },
  { label: "₹10 - ₹20 Lakh", value: "1000000-2000000" },
  { label: "Above ₹20 Lakh", value: "2000000-99999999" },
];

const HERO_IMAGES = [
  carfirst,
  carsecond,
  carthird,
  carfourth,
];

const HeroSearch = () => {
  const navigate = useNavigate();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const [api, setApi] = useState<CarouselApi>();
  
  const [activeTab, setActiveTab] = useState<"new" | "used">("new");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedBodyType, setSelectedBodyType] = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");

  const handleSearch = () => {
    if (selectedBrand && selectedBrand !== "all") {
      const brand = brands.find((b: any) => b.id === selectedBrand);
      if (brand) navigate(`/${brand.slug}`);
    } else if (selectedBodyType && selectedBodyType !== "all") {
      navigate(`/brands?bodyType=${selectedBodyType.toLowerCase()}`);
    } else if (selectedPriceRange && selectedPriceRange !== "all") {
      const [min, max] = selectedPriceRange.split("-");
      navigate(`/brands?priceMin=${min}&priceMax=${max || "99999999"}`);
    } else {
      navigate("/brands");
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      
      {/* ----------------------------------------------------------------------- */}
      {/* 1. FULL SCREEN BACKGROUND CAROUSEL */}
      {/* ----------------------------------------------------------------------- */}
      <div className="absolute inset-0 z-0">
        <Carousel
          setApi={setApi}
          opts={{ loop: true, align: "start", duration: 60 }}
          plugins={[Autoplay({ delay: 6000, stopOnInteraction: false })]}
          className="w-full h-full"
        >
          <CarouselContent className="h-full ml-0">
            {HERO_IMAGES.map((image, index) => (
              <CarouselItem key={index} className="pl-0 h-full w-full">
                <div className="w-full h-full relative">
                  <img
                    src={image}
                    alt={`Hero Background ${index + 1}`}
                    className="w-full h-full object-cover object-center animate-slow-zoom" 
                    style={{ animation: 'zoomIn 20s infinite alternate' }} 
                  />
                  {/* Dark Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 2. MAIN CONTENT */}
      {/* ----------------------------------------------------------------------- */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center mt-16 sm:mt-0">
          
          {/* --- LEFT: SEARCH CARD (GLASSMORPHISM) --- */}
          <div className="lg:col-span-5 order-2 lg:order-1 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 relative overflow-hidden">
              
              {/* Decorative Shine */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-2 drop-shadow-md">
                Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Perfect Car</span>
              </h2>

              {/* Tabs */}
              <div className="flex p-1.5 bg-black/40 rounded-xl mb-6 w-fit border border-white/10 backdrop-blur-sm">
                <button 
                  onClick={() => setActiveTab("new")}
                  className={cn(
                    "px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
                    activeTab === "new" 
                      ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg" 
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  New Car
                </button>
                <button 
                  onClick={() => setActiveTab("used")}
                  className={cn(
                    "px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
                    activeTab === "used" 
                      ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg" 
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  Used Car
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                {/* Brand Select */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest ml-1">Select Brand</label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="h-12 bg-white/90 border-transparent focus:ring-2 focus:ring-orange-500 rounded-xl font-semibold text-slate-800">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {!brandsLoading && brands.map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Body Type */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest ml-1">Body Type</label>
                    <Select value={selectedBodyType} onValueChange={setSelectedBodyType}>
                      <SelectTrigger className="h-12 bg-white/90 border-transparent focus:ring-2 focus:ring-orange-500 rounded-xl font-semibold text-slate-800">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Type</SelectItem>
                        {BODY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Budget */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest ml-1">Budget</label>
                    <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                      <SelectTrigger className="h-12 bg-white/90 border-transparent focus:ring-2 focus:ring-orange-500 rounded-xl font-semibold text-slate-800">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Budget</SelectItem>
                        {PRICE_RANGES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold shadow-xl shadow-orange-600/30 mt-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 transition-all active:scale-[0.98] border border-orange-400/20"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Cars
                </Button>
                
                <div className="text-center pt-2">
                  <span className="text-xs font-semibold text-slate-300 cursor-pointer hover:text-white transition-colors flex items-center justify-center gap-1 group">
                    Advanced Search Options <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT: HERO TEXT --- */}
          <div className="lg:col-span-7 order-1 lg:order-2 text-white flex flex-col justify-center h-full pl-0 lg:pl-12">
            
            <div className="mb-10 lg:mb-16 space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-orange-200 text-sm font-semibold w-fit backdrop-blur-md shadow-lg">
                <Sparkles className="w-4 h-4 fill-orange-400 text-orange-400" />
                <span>India's #1 Car Comparison Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] drop-shadow-2xl">
                Compare the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-200 to-orange-400 animate-gradient-xy">
                  Drive.
                </span>
              </h1>
              
              <p className="text-lg text-slate-200 max-w-xl leading-relaxed drop-shadow-lg font-medium">
                Analyze variant-wise features, specs, and on-road prices. The smartest way to choose your next ride.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button className="h-14 px-8 rounded-full text-base font-bold bg-white text-slate-950 hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  Start Comparing
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" className="h-14 px-8 rounded-full text-base font-bold border-white/30 bg-black/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-md">
                  View Offers
                </Button>
              </div>
            </div>

            {/* Floating Stats Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {[
                { icon: Car, label: "1000+", sub: "Models" },
                { icon: ShieldCheck, label: "50+", sub: "Brands" },
                { icon: Zap, label: "Instant", sub: "Comparisons" },
                { icon: Users, label: "1M+", sub: "Users" },
              ].map((stat, i) => (
                <div key={i} className="group bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-default hover:-translate-y-1">
                  <stat.icon className="w-6 h-6 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-bold text-white mb-0.5">{stat.label}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.sub}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;