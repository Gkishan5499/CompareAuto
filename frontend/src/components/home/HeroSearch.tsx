import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronDown, DollarSign, Zap, Cog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useBrands } from "@/lib/api-hooks";
import { searchApi, citiesApi } from "@/lib/api";
import { useCity } from "@/contexts/CityContext";
import { cn } from "@/lib/utils";

// Fallback images
import carfirst from "@/assets/hero/car1.jpg";
import carsecond from "@/assets/hero/car2.jpg";
import carthird from "@/assets/hero/car3.jpg";
import carfourth from "@/assets/hero/car4.jpg";

const FALLBACK_IMAGES = [
  carfirst,
  carsecond,
  carthird,
  carfourth,
];

// Filter options
const BUDGET_OPTIONS = ["Under 5L", "5L - 10L", "10L - 15L", "15L - 25L", "25L - 50L", "Above 50L"];
const BODY_TYPE_OPTIONS = ["Sedan", "SUV", "Hatchback", "MUV", "Coupe", "Convertible"];
const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "CNG", "Hybrid", "Electric"];
const TRANSMISSION_OPTIONS = ["Manual", "Automatic"];

const HeroSearch = () => {
  const navigate = useNavigate();
  const { data: brands = [] } = useBrands();
  const { city, setCity } = useCity();
  const [api, setApi] = useState<CarouselApi>();
  const [heroImages, setHeroImages] = useState<any[]>([]);
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
      try {
        const response = await fetch("/api/hero-carousel/active");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log("✅ Hero images loaded from backend:", data.length, "images");
            setHeroImages(data);
          } else {
            console.warn("⚠️ No active hero images from backend, using fallback");
            setHeroImages(FALLBACK_IMAGES.map((img, idx) => ({ imageUrl: img, title: `Hero ${idx + 1}` })));
          }
        } else {
          console.warn("⚠️ Failed to fetch hero images (status: " + response.status + "), using fallback");
          setHeroImages(FALLBACK_IMAGES.map((img, idx) => ({ imageUrl: img, title: `Hero ${idx + 1}` })));
        }
      } catch (error) {
        console.error("❌ Error fetching hero images:", error);
        setHeroImages(FALLBACK_IMAGES.map((img, idx) => ({ imageUrl: img, title: `Hero ${idx + 1}` })));
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
  };

  const toggleFilterDropdown = (filterType: string) => {
    setShowFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType as keyof typeof prev]
    }));
  };

  const buildSearchQueryWithFilters = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.append("search", searchQuery);
    params.append("city", city);
    
    if (selectedFilters.budget) params.append("priceRange", selectedFilters.budget);
    if (selectedFilters.bodyType) params.append("bodyType", selectedFilters.bodyType);
    if (selectedFilters.fuelType) params.append("fuelType", selectedFilters.fuelType);
    if (selectedFilters.transmission) params.append("transmission", selectedFilters.transmission);
    
    return params.toString();
  };

  const handleSearchWithFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const queryString = buildSearchQueryWithFilters();
    if (activeTab === "new") {
      navigate(`/models?${queryString}`);
    } else {
      navigate(`/used-cars?${queryString}`);
    }
    setShowSuggestions(false);
  };

  const displayImages = heroImages.length > 0 ? heroImages : FALLBACK_IMAGES.map((img, idx) => ({ imageUrl: img, title: `Hero ${idx + 1}` }));

  return (
    <section className="relative w-full  pb-20">
      
      {/* ----------------------------------------------------------------------- */}
      {/* 1. HERO BANNER AREA (Image Only - Clean Modern Design) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden"> 
        
        {/* Background Carousel */}
        <Carousel
          setApi={setApi}
          opts={{ loop: true, align: "start", duration: 60 }}
          plugins={[Autoplay({ delay: 6000, stopOnInteraction: false })]}
          className="w-full h-full absolute inset-0 z-0 "
        >
          <CarouselContent className="h-full ml-0">
            {displayImages.map((item, index) => (
              <CarouselItem key={item.id || index} className="pl-0 h-full w-full ">
                <div className="w-full h-full relative ">
                  <img
                    src={item.imageUrl}
                    alt={item.title || `Hero Background ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.warn("⚠️ Image failed to load:", item.imageUrl);
                      // Use fallback image only if image fails
                      target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                    }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* REMOVED PROMOTIONAL TEXT OVERLAY - Clean banner only */}
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 2. SEARCH WIDGET (Overlapping Bottom) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="container mx-auto px-4 relative z-20 -mt-48" ref={searchRef}>
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 max-w-5xl mx-auto shadow-md">
            
            {/* Header: Title + Location */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Find Your Right Car</h2>
                <div className="relative">
                  <button
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                    className="flex items-center gap-2 text-gray-600 mt-2 md:mt-0 cursor-pointer hover:text-gray-900 group"
                  >
                    <span className="text-sm font-medium border-b border-dotted border-gray-400 group-hover:border-gray-900">{city}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* City Dropdown */}
                  {showCityDropdown && cities.length > 0 && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                      {cities.map((cityItem) => (
                        <button
                          key={cityItem.id || cityItem.name}
                          onClick={() => handleCitySelect(cityItem.name)}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                            city === cityItem.name && "bg-teal-50 text-teal-700 font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{cityItem.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
            </div>

            {/* Search Input Area */}
            <form onSubmit={handleSearch} className="relative">
                <div className="flex flex-col md:flex-row items-center border border-gray-300 rounded-full bg-white p-1.5 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all shadow-sm">
                    
                    {/* Toggle Switch */}
                    <div className="flex bg-gray-100 rounded-full p-1 w-full md:w-auto mb-2 md:mb-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab("new")}
                            className={cn(
                                "flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
                                activeTab === "new"
                                    ? "bg-[#B71F25] text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-800"
                            )}
                        >
                            New
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("used")}
                            className={cn(
                                "flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
                                activeTab === "used"
                                    ? "bg-[#B71F25] text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-800"
                            )}
                        >
                            Used
                        </button>
                    </div>

                    {/* Text Input */}
                    <div className="flex-1 w-full px-4 relative">
                        <Input 
                            type="text"
                            placeholder={activeTab === "new" ? "Search by brand or model name" : "Search used cars"}
                            className="border-0 shadow-none focus-visible:ring-0 text-base h-10 px-0 placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                        />
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                            {suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 text-base">
                                    {suggestion.name}
                                  </div>
                                  {suggestion.type === "brand" && (
                                    <div className="text-xs text-gray-500 mt-0.5">View all models</div>
                                  )}
                                  {suggestion.type === "model" && suggestion.bodyType && (
                                    <div className="text-xs text-gray-500 mt-0.5">{suggestion.bodyType}</div>
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
                        className="rounded-full bg-transparent hover:bg-gray-100 text-gray-600 w-10 h-10 md:w-12 md:h-12 shrink-0 hidden md:flex"
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                    
                    {/* Mobile Search Button (Full width) */}
                    <Button 
                        type="submit"
                        className="w-full rounded-full bg-[#B71F25] hover:bg-[#B71F25] text-white mt-2 md:hidden"
                    >
                        Search
                    </Button>
                </div>
            </form>

            {/* Filter Options Row */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
                
                {/* Budget Filter */}
                <div className="relative">
                  <button
                    onClick={() => toggleFilterDropdown("budget")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      selectedFilters.budget
                        ? "bg-teal-50 border-teal-300 text-teal-700"
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                    )}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Budget</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showFilters.budget && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      {BUDGET_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            handleFilterSelect("budget", option);
                            toggleFilterDropdown("budget");
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                            selectedFilters.budget === option && "bg-teal-50 text-teal-700 font-medium"
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
                        ? "bg-teal-50 border-teal-300 text-teal-700"
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span>Body Type</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showFilters.bodyType && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      {BODY_TYPE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            handleFilterSelect("bodyType", option);
                            toggleFilterDropdown("bodyType");
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                            selectedFilters.bodyType === option && "bg-teal-50 text-teal-700 font-medium"
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
                        ? "bg-teal-50 border-teal-300 text-teal-700"
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                    )}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Fuel Type</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showFilters.fuelType && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      {FUEL_TYPE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            handleFilterSelect("fuelType", option);
                            toggleFilterDropdown("fuelType");
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                            selectedFilters.fuelType === option && "bg-teal-50 text-teal-700 font-medium"
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
                        ? "bg-teal-50 border-teal-300 text-teal-700"
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                    )}
                  >
                    <Cog className="h-4 w-4" />
                    <span>Transmission</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showFilters.transmission && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      {TRANSMISSION_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            handleFilterSelect("transmission", option);
                            toggleFilterDropdown("transmission");
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                            selectedFilters.transmission === option && "bg-teal-50 text-teal-700 font-medium"
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
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:border-gray-400 transition-all"
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