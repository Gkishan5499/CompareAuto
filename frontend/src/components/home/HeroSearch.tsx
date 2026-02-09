import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronDown, DollarSign, Zap, Cog, Users, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useBrands } from "@/lib/api-hooks";
import { searchApi, citiesApi } from "@/lib/api";
import { useCity } from "@/contexts/CityContext";
import { cn } from "@/lib/utils";

// Filter options
const BUDGET_OPTIONS = ["Under 5L", "5L - 10L", "10L - 15L", "15L - 25L", "25L - 50L", "Above 50L"];
const BODY_TYPE_OPTIONS = ["Sedan", "SUV", "Hatchback", "MUV", "Coupe", "Convertible"];
const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "CNG", "Hybrid", "Electric"];
const TRANSMISSION_OPTIONS = ["Manual", "Automatic"];

const BUDGET_RANGES: Record<string, { min: number; max: number; maxLakh: number }> = {
  "Under 5L": { min: 0, max: 500000, maxLakh: 5 },
  "5L - 10L": { min: 500000, max: 1000000, maxLakh: 10 },
  "10L - 15L": { min: 1000000, max: 1500000, maxLakh: 15 },
  "15L - 25L": { min: 1500000, max: 2500000, maxLakh: 25 },
  "25L - 50L": { min: 2500000, max: 5000000, maxLakh: 50 },
  "Above 50L": { min: 5000000, max: 5000000, maxLakh: 50 },
};

const HeroSearch = () => {
  const navigate = useNavigate();
  const { data: brands = [] } = useBrands();
  const { city, setCity } = useCity();
  const [api, setApi] = useState<CarouselApi>();
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [heroImagesLoading, setHeroImagesLoading] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"new" | "used">("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    budget: "",
    bodyType: "",
    fuelType: "",
    transmission: ""
  });
  const [showFilters, setShowFilters] = useState({
    budget: false,
    bodyType: false,
    fuelType: false,
    transmission: false
  });

  // Fetch hero carousel images from backend
  useEffect(() => {
    const fetchHeroImages = async () => {
      setHeroImagesLoading(true);
      try {
        const response = await fetch("/api/hero-carousel/active");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setHeroImages(data);
          } else {
            setHeroImages([]);
          }
        } else {
          setHeroImages([]);
        }
      } catch (error) {
        console.error("❌ Error fetching hero images:", error);
        setHeroImages([]);
      } finally {
        setHeroImagesLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  // Fetch cities for dropdown
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesData = await citiesApi.getAll();
        setCities(citiesData);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };
    fetchCities();
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    if (searchQuery.length > 1) {
      const fetchSuggestions = async () => {
        try {
          const results = await searchApi.getSuggestions(searchQuery);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Failed to fetch suggestions:", error);
        }
      };
      const debounceTimer = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    handleSearchWithFilters(e);
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === "brand") {
      navigate(`/brands/${suggestion.brandSlug}`);
    } else if (suggestion.type === "model") {
      navigate(`/${suggestion.brandSlug}/${suggestion.slug}`);
    } else if (suggestion.type === "variant") {
      navigate(`/${suggestion.brandSlug}/${suggestion.modelSlug}/${suggestion.slug}`);
    }
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setShowCityDropdown(false);
  };

  const handleFilterSelect = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType as keyof typeof prev] === value ? "" : value
    }));

    // // close dropdown automatically
    // setShowFilters(prev => ({
    //   ...prev,
    //   [filterType]: false
    // }));

  };

  // const toggleFilterDropdown = (filterType: string) => {
  //   setShowFilters(prev => ({
  //     ...prev,
  //     [filterType]: !prev[filterType as keyof typeof prev]
  //   }));
  // };

  const toggleFilterDropdown = (filterType: string) => {
  setShowFilters(prev => {
    const isCurrentlyOpen = prev[filterType as keyof typeof prev];

    // close all dropdowns first
    const closedAll = Object.keys(prev).reduce((acc, key) => {
      acc[key as keyof typeof prev] = false;
      return acc;
    }, {} as typeof prev);

    // open clicked dropdown if it was closed
    return {
      ...closedAll,
      [filterType]: !isCurrentlyOpen
    };
  });
};


  const buildSearchQueryWithFilters = (tab: "new" | "used") => {
    const params = new URLSearchParams();

    if (searchQuery) params.append("q", searchQuery);

    const budgetRange = selectedFilters.budget ? BUDGET_RANGES[selectedFilters.budget] : undefined;
    if (tab === "new") {
      if (budgetRange) {
        params.append("priceMin", String(budgetRange.min));
        params.append("priceMax", String(budgetRange.max));
      }
      if (selectedFilters.bodyType) params.append("body", selectedFilters.bodyType);
      if (selectedFilters.fuelType) params.append("fuel", selectedFilters.fuelType);
      if (selectedFilters.transmission) params.append("transmission", selectedFilters.transmission);
    } else {
      if (city) params.append("city", city);
      if (budgetRange) params.append("priceMax", String(budgetRange.maxLakh));
    }

    return params.toString();
  };

  const handleSearchWithFilters = (e?: React.FormEvent) => {
    e?.preventDefault();

    const queryString = buildSearchQueryWithFilters(activeTab);
    const querySuffix = queryString ? `?${queryString}` : "";
    if (activeTab === "new") {
      navigate(`/new-cars${querySuffix}`);
    } else {
      navigate(`/used-cars/search${querySuffix}`);
    }
    setShowSuggestions(false);
  };

  const displayImages = heroImages;

  return (
    <section className="relative w-full pb-8 md:pb-16 bg-background">

      {/* ----------------------------------------------------------------------- */}
      {/* 1. HERO BANNER AREA (Image Only - Clean Modern Design) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="relative w-full h-[220px] sm:h-[360px] md:h-[520px] lg:h-[600px] overflow-hidden">

        {/* Background Carousel */}
        <Carousel
          setApi={setApi}
          opts={{ loop: true, align: "start", duration: 60 }}
          plugins={[Autoplay({ delay: 6000, stopOnInteraction: false })]}
          className="w-full h-full absolute inset-0 z-0 "
        >
          <CarouselContent className="h-full ml-0">
            {heroImagesLoading && (
              <CarouselItem className="pl-0 h-full w-full">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/60 to-muted">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Loading hero images...</span>
                  </div>
                </div>
              </CarouselItem>
            )}
            {!heroImagesLoading && displayImages.length === 0 && (
              <CarouselItem className="pl-0 h-full w-full">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/60 to-muted">
                  <div className="text-muted-foreground text-sm font-medium">Hero images will appear here</div>
                </div>
              </CarouselItem>
            )}
            {!heroImagesLoading && displayImages.map((item, index) => (
              <CarouselItem key={item.id || index} className="pl-0 h-full w-full">
                <div className="w-full h-full relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title || `Hero Background ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-3 sm:left-4 md:left-6 bg-white/80 hover:bg-white text-black border-white/60 h-9 w-9 sm:h-10 sm:w-10" />
          <CarouselNext className="right-3 sm:right-4 md:right-6 bg-white/80 hover:bg-white text-black border-white/60 h-9 w-9 sm:h-10 sm:w-10" />
        </Carousel>

        {/* REMOVED PROMOTIONAL TEXT OVERLAY - Clean banner only */}
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 2. SEARCH WIDGET (Overlapping Bottom) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="container max-w-4xl mx-auto px-4 relative z-20 -mt-16 sm:-mt-20 md:-mt-24" ref={searchRef}>
        <div className="bg-card rounded-lg border border-border p-6 md:p-8 max-w-5xl mx-auto shadow-premium-lg">

          {/* Header: Title + Location */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-border pb-4">
            <h2 className="text-2xl font-bold text-primary">Find Your Right Car</h2>
            <div className="relative">
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center gap-2 text-muted-foreground mt-2 md:mt-0 cursor-pointer hover:text-primary group transition-colors"
              >
                <span className="text-sm font-medium border-b border-dotted border-muted-foreground group-hover:border-primary transition-colors">{city}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* City Dropdown */}
              {showCityDropdown && cities.length > 0 && (
                <div className="absolute right-0 mt-2 w-64 bg-card rounded-lg shadow-premium-xl border border-border max-h-80 overflow-y-auto z-50">
                  {cities.map((cityItem) => (
                    <div
                      key={cityItem.id || cityItem.name}
                      onClick={() => handleCitySelect(cityItem.name)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 cursor-pointer",
                        city === cityItem.name && "bg-accent-muted text-primary font-medium border-l-4 border-l-accent"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{cityItem.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Input Area */}
          <form onSubmit={handleSearch} className="relative">
            <div className="flex flex-col md:flex-row items-center border border-border rounded-full bg-card p-1.5 focus-within:ring-2 focus-within:ring-accent/30 transition-all shadow-premium-sm">

              {/* Toggle Switch */}
              <div className="flex bg-muted rounded-full p-1 w-full md:w-auto mb-2 md:mb-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("new")}
                  className={cn(
                    "flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    activeTab === "new"
                      ? "bg-primary text-primary-foreground shadow-premium-md"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  New
                </button>
                {/* <button
                            type="button"
                            onClick={() => setActiveTab("used")}
                            className={cn(
                                "flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
                                activeTab === "used"
                                    ? "bg-primary text-primary-foreground shadow-premium-md"
                                    : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            Used
                        </button> */}
              </div>

              {/* Text Input */}
              <div className="flex-1 w-full px-4 relative">
                <Input
                  type="text"
                  placeholder={activeTab === "new" ? "Search by brand or model name" : "Search used cars"}
                  className="border-0 shadow-none focus-visible:ring-0 text-base h-10 px-0 placeholder:text-muted-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg shadow-premium-xl border border-border max-h-96 overflow-y-auto z-50">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 flex items-center gap-3"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-primary text-base">
                            {suggestion.name}
                          </div>
                          {suggestion.type === "brand" && (
                            <div className="text-xs text-muted-foreground mt-0.5">View all models</div>
                          )}
                          {suggestion.type === "model" && suggestion.bodyType && (
                            <div className="text-xs text-muted-foreground mt-0.5">{suggestion.bodyType}</div>
                          )}
                        </div>
                        {suggestion.type && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {suggestion.type}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Icon Button */}
              <Button
                type="submit"
                size="icon"
                className="rounded-full bg-transparent hover:bg-muted text-muted-foreground hover:text-primary w-10 h-10 md:w-12 md:h-12 shrink-0 hidden md:flex transition-colors"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Mobile Search Button (Full width) - Premium Gold Accent */}
              <Button
                type="submit"
                className="w-full rounded-full bg-accent hover:bg-accent-light text-accent-foreground shadow-gold mt-2 md:hidden transition-all"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Filter Options Row */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">

            {/* Budget Filter */}
            <div className="relative">
              <button
                onClick={() => toggleFilterDropdown("budget")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  selectedFilters.budget
                    ? "bg-accent-muted border-accent text-primary shadow-gold"
                    : "bg-card border-border text-foreground hover:border-primary"
                )}
              >
                <IndianRupee className="h-4 w-4" />
                <span>Budget</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showFilters.budget && (
                <div className="absolute left-0 mt-2 w-56 bg-card rounded-lg shadow-premium-xl border border-border z-50">
                  {BUDGET_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        handleFilterSelect("budget", option);
                        toggleFilterDropdown("budget");
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0",
                        selectedFilters.budget === option && "bg-accent-muted text-primary font-medium border-l-4 border-l-accent"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Body Type Filter */}
            <div className="relative">
              <button
                onClick={() => toggleFilterDropdown("bodyType")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  selectedFilters.bodyType
                    ? "bg-accent-muted border-accent text-primary shadow-gold"
                    : "bg-card border-border text-foreground hover:border-primary"
                )}
              >
                <Users className="h-4 w-4" />
                <span>Body Type</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showFilters.bodyType && (
                <div className="absolute left-0 mt-2 w-56 bg-card rounded-lg shadow-premium-xl border border-border z-50">
                  {BODY_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        handleFilterSelect("bodyType", option);
                        toggleFilterDropdown("bodyType");
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0",
                        selectedFilters.bodyType === option && "bg-accent-muted text-primary font-medium border-l-4 border-l-accent"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fuel Type Filter */}
            <div className="relative">
              <button
                onClick={() => toggleFilterDropdown("fuelType")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  selectedFilters.fuelType
                    ? "bg-accent-muted border-accent text-primary shadow-gold"
                    : "bg-card border-border text-foreground hover:border-primary"
                )}
              >
                <Zap className="h-4 w-4" />
                <span>Fuel Type</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showFilters.fuelType && (
                <div className="absolute left-0 mt-2 w-56 bg-card rounded-lg shadow-premium-xl border border-border z-50">
                  {FUEL_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        handleFilterSelect("fuelType", option);
                        toggleFilterDropdown("fuelType");
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0",
                        selectedFilters.fuelType === option && "bg-accent-muted text-primary font-medium border-l-4 border-l-accent"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Transmission Filter */}
            <div className="relative">
              <button
                onClick={() => toggleFilterDropdown("transmission")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  selectedFilters.transmission
                    ? "bg-accent-muted border-accent text-primary shadow-gold"
                    : "bg-card border-border text-foreground hover:border-primary"
                )}
              >
                <Cog className="h-4 w-4" />
                <span>Transmission</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showFilters.transmission && (
                <div className="absolute left-0 mt-2 w-56 bg-card rounded-lg shadow-premium-xl border border-border z-50">
                  {TRANSMISSION_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        handleFilterSelect("transmission", option);
                        toggleFilterDropdown("transmission");
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0",
                        selectedFilters.transmission === option && "bg-accent-muted text-primary font-medium border-l-4 border-l-accent"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* All Filters Button */}
            <button
              type="button"
              onClick={handleSearchWithFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-border bg-card text-foreground hover:border-primary hover:text-primary transition-all"
            >
              <Search className="h-4 w-4" />
              <span>All Filters</span>
            </button>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSearch;