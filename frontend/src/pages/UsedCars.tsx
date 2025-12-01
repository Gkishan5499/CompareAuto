import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Search, MapPin, CheckCircle2 } from "lucide-react";
import { getUsedCars, getUsedCities, UsedCar } from "@/lib/data";
import { updateMetaTags, injectStructuredData, generateItemListSchema } from "@/lib/seo";

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
      title: "Used Cars in India – Buy Second-hand Cars | CompareAuto.in",
      description:
        "Find the best deals on used cars in India. Browse verified second-hand cars from top cities with detailed specifications, prices, and seller information.",
      keywords: ["used cars", "second hand cars", "pre-owned cars", "buy used cars", "certified used cars"],
      ogImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Used Cars in India</h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Find the best deals on verified second-hand cars from trusted dealers and individual sellers
          </p>

          {/* City Selector */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Browse by City
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {topCities.map((city) => (
                <Badge
                  key={city}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2 text-sm"
                  onClick={() => handleCityClick(city)}
                >
                  {city}
                </Badge>
              ))}
            </div>
            <div className="max-w-xs">
              <Select value={selectedCity} onValueChange={handleCityClick}>
                <SelectTrigger>
                  <SelectValue placeholder="Or select from all cities" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
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

      <AdSlot id="used_cars_top_leaderboard" sizeMap={{ mobile: "320x50", desktop: "728x90" }} />

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <UsedFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                brands={allBrands}
              />
            </aside>

            {/* Listings Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Featured Listings</h2>
                <p className="text-muted-foreground">{filteredCars.length} cars found</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <UsedCarCard key={car.id} {...car} />
                ))}
              </div>

              {filteredCars.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No cars found matching your criteria</p>
                  <Button onClick={handleClearFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AdSlot id="used_cars_mid_billboard" sizeMap={{ mobile: "300x250", desktop: "970x250" }} />

      {/* How It Works */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Search</h3>
              <p className="text-muted-foreground">
                Browse through thousands of verified used cars across India
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Shortlist</h3>
              <p className="text-muted-foreground">
                Compare prices, features, and seller details to find your perfect match
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Contact</h3>
              <p className="text-muted-foreground">
                Connect directly with sellers and schedule a test drive
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I verify a used car listing?</AccordionTrigger>
              <AccordionContent>
                Look for the "Verified" badge on listings. Always inspect the vehicle in person, check
                all documents (RC, insurance, NOC), and consider getting a professional inspection before
                purchase.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What documents should I check?</AccordionTrigger>
              <AccordionContent>
                Essential documents include: Registration Certificate (RC), valid insurance policy, PUC
                certificate, NOC from bank/finance company (if applicable), service history, and original
                invoice. Verify that the seller's name matches the RC.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Should I get a professional inspection?</AccordionTrigger>
              <AccordionContent>
                Yes, we highly recommend a professional inspection. It can identify hidden issues,
                estimate repair costs, and help you negotiate a better price. Many services offer
                comprehensive pre-purchase inspections.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Is CompareAuto a car dealer?</AccordionTrigger>
              <AccordionContent>
                No, CompareAuto is a platform that connects buyers with sellers. We do not sell cars
                directly. Always verify seller credentials and vehicle documents independently before
                making a purchase.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default UsedCars;
