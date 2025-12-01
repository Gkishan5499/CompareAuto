import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { updateMetaTags, injectStructuredData } from "@/lib/seo";
import { listDealers, listBrandsFromDealers, listStates, listCities, getPopularCities } from "@/lib/dealers";
import DealerCard from "@/components/dealers/DealerCard";
import DealerFilters from "@/components/dealers/DealerFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

const Dealers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get filters from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "all");
  const [selectedState, setSelectedState] = useState(searchParams.get("state") || "all");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "all");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));

  // Fetch filter options
  const brands = listBrandsFromDealers();
  const states = listStates();
  const cities = listCities(selectedState !== "all" ? selectedState : undefined);
  const popularCities = getPopularCities();

  // Fetch dealers
  const { items: dealers, total, totalPages } = listDealers({
    q: searchQuery,
    brand: selectedBrand,
    state: selectedState,
    city: selectedCity,
    category: selectedCategory,
    page: currentPage,
    pageSize: 20,
  });

  // Update URL when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedBrand !== "all") params.brand = selectedBrand;
    if (selectedState !== "all") params.state = selectedState;
    if (selectedCity !== "all") params.city = selectedCity;
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (currentPage > 1) params.page = currentPage.toString();

    setSearchParams(params);
  }, [searchQuery, selectedBrand, selectedState, selectedCity, selectedCategory, currentPage, setSearchParams]);

  // SEO
  useEffect(() => {
    updateMetaTags({
      title: "Car Dealers in India – Authorized Showrooms & Service Centers | CompareAuto.in",
      description: "Find authorized car dealers, showrooms, and service centers across India. Search by brand, location, and services. Get contact details and directions.",
      keywords: ["car dealers india", "authorized showrooms", "service centers", "car dealerships", "automotive dealers"],
      canonical: "https://compareauto.in/dealers",
    });

    // ItemList structured data
    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Car Dealers in India",
      itemListElement: dealers.slice(0, 20).map((dealer, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "AutoDealer",
          name: dealer.name,
          url: `https://compareauto.in/dealers/${dealer.id}`,
          address: {
            "@type": "PostalAddress",
            streetAddress: `${dealer.address.line1}, ${dealer.address.line2}`,
            addressLocality: dealer.address.city,
            addressRegion: dealer.address.state,
            postalCode: dealer.address.pincode,
            addressCountry: "IN",
          },
        },
      })),
    };
    injectStructuredData(itemListSchema);
  }, [dealers]);

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedBrand("all");
    setSelectedState("all");
    setSelectedCity("all");
    setSelectedCategory("all");
    setCurrentPage(1);
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity("all"); // Reset city when state changes
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="mb-4">Car Dealers in India</h1>
            <p className="text-lg text-muted-foreground">
              Find authorized car dealers, showrooms, and service centers across India. 
              Search by brand, location, and services offered.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Cities Strip */}
      <section className="py-6 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Popular Cities</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularCities.map(({ city, count }) => (
              <Badge
                key={city}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  setSelectedCity(city);
                  setCurrentPage(1);
                }}
              >
                {city} ({count})
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-background border-b">
        <div className="container mx-auto px-4">
          <DealerFilters
            searchQuery={searchQuery}
            selectedBrand={selectedBrand}
            selectedState={selectedState}
            selectedCity={selectedCity}
            selectedCategory={selectedCategory}
            brands={brands}
            states={states}
            cities={cities}
            onSearchChange={setSearchQuery}
            onBrandChange={(value) => {
              setSelectedBrand(value);
              setCurrentPage(1);
            }}
            onStateChange={handleStateChange}
            onCityChange={(value) => {
              setSelectedCity(value);
              setCurrentPage(1);
            }}
            onCategoryChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            onClearAll={handleClearAll}
          />
        </div>
      </section>

      {/* Results */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {dealers.length} of {total} dealers
              {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </p>
          </div>

          {dealers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {dealers.map((dealer) => (
                  <DealerCard key={dealer.id} dealer={dealer} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && <span className="px-2">...</span>}
                    {totalPages > 5 && (
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No dealers found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Brand Quick Links */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold mb-4">Find Dealers by Brand</h2>
          <div className="flex flex-wrap gap-2">
            {brands.slice(0, 20).map((brand) => (
              <Link
                key={brand}
                to={`/dealers?brand=${brand}`}
                className="text-sm px-4 py-2 rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-colors border"
              >
                {brand} Dealers
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dealers;
