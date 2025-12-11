import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent} from "@/components/ui/card";
import { UsedCarCard } from "@/components/used/UsedCarCard";
import { UsedFilters } from "@/components/used/UsedFilters";
import AdSlot from "@/components/ads/AdSlot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, MapPin, CheckCircle2, Car, FilterX, ArrowRight } from "lucide-react";
import { getUsedCars, getUsedCities, UsedCar } from "@/lib/data";
import { updateMetaTags, injectStructuredData, generateItemListSchema, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { cn } from "@/lib/utils";

const UsedCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<UsedCar[]>([]);
  const [filteredCars, setFilteredCars] = useState<UsedCar[]>([]);
  const cities = getUsedCities();
  const [selectedCity, setSelectedCity] = useState("all");
  const [filters, setFilters] = useState({
    brand: "all",
    fuel: "all",
    transmission: "all",
    priceMax: 5000000,
    yearMin: 2010,
    kmsMax: 200000,
    owners: 0,
  });

  const topCities = ["Delhi NCR", "Mumbai", "Bangalore", "Pune", "Hyderabad", "Chennai"];
  const allBrands = Array.from(new Set(cars.map((car) => car.brand))).sort();

  useEffect(() => {
    const allCars = getUsedCars();
    setCars(allCars);
    setFilteredCars(allCars.slice(0, 12));

    // SEO
    updateMetaTags({
      title: "Used Cars in India – Buy Verified Second-hand Cars",
      description: "Browse thousands of verified used cars in India. Filter by city, price, brand, and more. Get the best deals on pre-owned vehicles.",
      keywords: ["used cars", "second hand cars", "pre-owned cars", "buy used cars", "certified used cars"],
      canonical: `${window.location.origin}/used-cars`,
      ogImage: DEFAULT_OG_IMAGE,
    });

    const schema = generateItemListSchema(
      allCars.slice(0, 12).map((car, idx) => ({
        name: car.title,
        url: `https://compareauto.in${car.listingUrl}`,
        position: idx + 1,
      }))
    );
    injectStructuredData(schema);
  }, []);

  useEffect(() => {
    let result = cars;

    // Apply filters
    if (filters.brand !== "all") {
      result = result.filter((car) => car.brand === filters.brand);
    }
    if (filters.fuel !== "all") {
      result = result.filter((car) => car.fuel === filters.fuel);
    }
    if (filters.transmission !== "all") {
      result = result.filter((car) => car.transmission === filters.transmission);
    }
    result = result.filter((car) => car.price <= filters.priceMax);
    result = result.filter((car) => car.year >= filters.yearMin);
    result = result.filter((car) => car.kms <= filters.kmsMax);
    if (filters.owners > 0) {
      result = result.filter((car) => car.owners <= filters.owners);
    }

    setFilteredCars(result.slice(0, 12));
  }, [filters, cars]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      brand: "all",
      fuel: "all",
      transmission: "all",
      priceMax: 5000000,
      yearMin: 2010,
      kmsMax: 200000,
      owners: 0,
    });
  };

  const handleCityClick = (city: string) => {
    const citySlug = city.toLowerCase().replace(/\s+/g, "-");
    navigate(`/used-cars/${citySlug}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="bg-white dark:bg-card border-b pt-12 pb-10">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <CheckCircle2 className="w-3 h-3" /> 100% Verified Listings
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Find Your Next <span className="text-primary">Used Car</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Browse reliable, inspected, and certified second-hand cars at the best prices.
          </p>

          {/* City Selection Pill */}
          <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 pl-4 text-sm font-semibold text-muted-foreground w-full md:w-auto mb-2 md:mb-0">
                <MapPin className="w-4 h-4 text-primary" />
                Select City:
            </div>
            
            <div className="flex-1 flex flex-wrap gap-2 justify-center md:justify-start">
                {topCities.map((city) => (
                    <button
                        key={city}
                        onClick={() => handleCityClick(city)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-slate-800 border hover:border-primary hover:text-primary transition-all shadow-sm"
                    >
                        {city}
                    </button>
                ))}
            </div>

            <div className="w-full md:w-48">
                <Select value={selectedCity} onValueChange={handleCityClick}>
                    <SelectTrigger className="h-9 text-xs border-0 bg-transparent focus:ring-0">
                        <SelectValue placeholder="More Cities" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {cities.map((city) => (
                            <SelectItem key={city} value={city.toLowerCase().replace(/\s+/g, "-")}>
                                {city}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl mt-8">
        <AdSlot id="used_cars_top_leaderboard" sizeMap={{ mobile: "320x50", desktop: "728x90" }} />
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="container mx-auto px-4 max-w-7xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-5 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <FilterX className="w-4 h-4" /> Filters
                    </h3>
                    <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 text-xs text-muted-foreground hover:text-destructive">
                        Reset
                    </Button>
                </div>
                <UsedFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                    brands={allBrands}
                />
            </div>
          </aside>

          {/* RIGHT CONTENT: LISTINGS */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    Available Cars
                    <Badge variant="secondary" className="ml-2">{filteredCars.length}</Badge>
                </h2>
                
                <Select defaultValue="newest">
                    <SelectTrigger className="w-[160px] h-9">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest Listed</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                        <SelectItem value="km_low">Kms: Low to High</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {filteredCars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCars.map((car) => (
                        <UsedCarCard key={car.id} {...car} />
                    ))}
                </div>
            ) : (
                <Card className="py-16 flex flex-col items-center justify-center text-center border-dashed">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No cars match your filters</h3>
                    <p className="text-muted-foreground max-w-xs mt-2 mb-6">
                        Try adjusting your price range, brand, or fuel type preferences.
                    </p>
                    <Button onClick={handleClearFilters}>Clear All Filters</Button>
                </Card>
            )}

            {/* Pagination Placeholder (if needed later) */}
            {filteredCars.length > 0 && (
                <div className="mt-10 flex justify-center">
                    <Button variant="outline" size="lg" className="gap-2">
                        Load More Cars <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl mb-12">
        <AdSlot id="used_cars_mid_billboard" sizeMap={{ mobile: "300x250", desktop: "970x250" }} />
      </div>

      {/* 3. HOW IT WORKS */}
      <section className="bg-white dark:bg-card border-y py-16">
        <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-bold mb-4">Buying Used Cars Made Simple</h2>
                <p className="text-muted-foreground">Three easy steps to drive home your dream car without the hassle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: Search, title: "Search & Filter", desc: "Browse thousands of verified listings based on your budget and preferences." },
                    { icon: CheckCircle2, title: "Inspect & Verify", desc: "Check detailed inspection reports and verify car history before booking." },
                    { icon: Car, title: "Drive Home", desc: "Connect with the seller, test drive, and close the deal securely." }
                ].map((step, idx) => (
                    <Card key={idx} className="border-0 shadow-none bg-slate-50 dark:bg-slate-900 text-center p-8 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="w-14 h-14 mx-auto bg-white dark:bg-black rounded-2xl flex items-center justify-center shadow-sm mb-6 text-primary">
                            <step.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full bg-white dark:bg-card rounded-xl border px-6">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-base font-medium">How are these cars verified?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                        Verified listings undergo a 140-point inspection check by certified engineers. Look for the "Verified" badge on the listing card.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-base font-medium">Can I get a loan for used cars?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                        Yes, most of our partner dealers offer financing options. You can also use our Loan Calculator tool to estimate EMIs.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-base font-medium">Is the price negotiable?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                        Prices are set by the seller. However, individual sellers are often open to reasonable negotiation after a test drive.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="border-b-0">
                    <AccordionTrigger className="text-base font-medium">What paperwork is required?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                        You'll need ID proof, address proof, and sale agreement. The seller must provide the RC, Insurance, and PUC certificate.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      </section>

    </div>
  );
};

export default UsedCars;