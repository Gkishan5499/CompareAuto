import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getUpcomingModels } from "@/lib/data";
import { upcomingCarsApi } from "@/lib/api";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Calendar, IndianRupee, SlidersHorizontal } from "lucide-react";
import { formatINR } from "@/lib/guards";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const UpcomingCars = () => {
  const [allUpcoming, setAllUpcoming] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [filters, setFilters] = useState({
    bodyType: "all",
    priceRange: "all",
    launchMonth: "all"
  });

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const data = await upcomingCarsApi.getAll();
        setAllUpcoming(data || getUpcomingModels());
      } catch (error) {
        console.error("Failed to fetch upcoming cars:", error);
        setAllUpcoming(getUpcomingModels());
      }
    };
    fetchUpcoming();
  }, []);

  const upcomingModels = useMemo(() => {
    let result = [...allUpcoming];

    if (filters.bodyType !== "all") {
      result = result.filter(m => m.bodyType === filters.bodyType);
    }

    if (filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-").map(Number);
      result = result.filter(m => {
        const price = m.expectedPriceMin || 0;
        return max ? (price >= min && price <= max) : price >= min;
      });
    }

    if (filters.launchMonth !== "all") {
      result = result.filter(m => {
        const launch = m.launchWindow || m.expectedLaunch || "";
        return launch.toLowerCase().includes(filters.launchMonth.toLowerCase());
      });
    }

    return result;
  }, [allUpcoming, filters]);

  useEffect(() => {
    updateMetaTags({
      title: "Upcoming Cars in India 2025 – Launch Dates & Expected Prices | CompareAuto.in",
      description:
        "Discover upcoming car launches in India. Get expected prices, launch dates, key features, and book your favorite car before launch.",
      keywords: [
        "upcoming cars",
        "car launches 2025",
        "expected car prices",
        "new car launches India",
      ],
      canonical: `${window.location.origin}/upcoming-cars`,
      ogImage: DEFAULT_OG_IMAGE,
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Upcoming Cars in India",
      itemListElement: upcomingModels.map((model, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: `${model.brandName} ${model.name}`,
          offers: {
            "@type": "AggregateOffer",
            lowPrice: model.expectedPriceMin,
            highPrice: model.expectedPriceMax,
            priceCurrency: "INR",
            availability: "https://schema.org/PreOrder",
            availabilityStarts: model.expectedLaunch,
          },
        },
      })),
    };
    injectStructuredData(structuredData);
  }, [upcomingModels]);

  const handleNotifyClick = (model: any) => {
    setSelectedModel(model);
    setIsEnquiryOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Cars in India</h1>
            <p className="text-lg text-muted-foreground">
              Stay ahead with the latest car launches. Get notified about expected prices, features, and
              launch dates.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 bg-muted/20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm mb-2 block">Body Type</Label>
              <Select value={filters.bodyType} onValueChange={(val) => setFilters({ ...filters, bodyType: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                  <SelectItem value="MUV">MUV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm mb-2 block">Price Range</Label>
              <Select value={filters.priceRange} onValueChange={(val) => setFilters({ ...filters, priceRange: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-500000">Under ₹5 Lakh</SelectItem>
                  <SelectItem value="500000-1000000">₹5-10 Lakh</SelectItem>
                  <SelectItem value="1000000-1500000">₹10-15 Lakh</SelectItem>
                  <SelectItem value="1500000-2500000">₹15-25 Lakh</SelectItem>
                  <SelectItem value="2500000-999999999">Above ₹25 Lakh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm mb-2 block">Launch Timeline</Label>
              <Select value={filters.launchMonth} onValueChange={(val) => setFilters({ ...filters, launchMonth: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="january">January</SelectItem>
                  <SelectItem value="february">February</SelectItem>
                  <SelectItem value="march">March</SelectItem>
                  <SelectItem value="april">April</SelectItem>
                  <SelectItem value="may">May</SelectItem>
                  <SelectItem value="june">June</SelectItem>
                  <SelectItem value="july">July</SelectItem>
                  <SelectItem value="august">August</SelectItem>
                  <SelectItem value="september">September</SelectItem>
                  <SelectItem value="october">October</SelectItem>
                  <SelectItem value="november">November</SelectItem>
                  <SelectItem value="december">December</SelectItem>
                  <SelectItem value="q1">Q1</SelectItem>
                  <SelectItem value="q2">Q2</SelectItem>
                  <SelectItem value="q3">Q3</SelectItem>
                  <SelectItem value="q4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ bodyType: "all", priceRange: "all", launchMonth: "all" })}
                className="whitespace-nowrap"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {upcomingModels.length} upcoming {upcomingModels.length === 1 ? 'car' : 'cars'}
          </div>
        </div>
      </section>

      {/* Upcoming Models Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {upcomingModels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingModels.map((model) => (
                <Card key={model.id} className="group hover:shadow-lg transition-all">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative aspect-[16/9] bg-muted rounded-t-2xl overflow-hidden">
                      <img
                        src={model.image || "/placeholder.svg"}
                        alt={`${model.brandName} ${model.name}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <Badge className="absolute top-4 right-4" variant="secondary">
                        Upcoming
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{model.brandName}</p>
                        <h3 className="text-2xl font-bold">{model.name}</h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Expected: {model.launchWindow || model.expectedLaunch}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg font-semibold">
                          {formatINR(model.expectedPriceMin, true)} -{" "}
                          {formatINR(model.expectedPriceMax, true)}
                        </span>
                      </div>

                      {model.keyFeatures && model.keyFeatures.length > 0 && (
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {model.keyFeatures.slice(0, 3).map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Button
                        className="w-full"
                        onClick={() => handleNotifyClick(model)}
                      >
                        Notify Me at Launch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No upcoming cars at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Enquiry Modal */}
      <Dialog open={isEnquiryOpen} onOpenChange={setIsEnquiryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Get Notified: {selectedModel?.brandName} {selectedModel?.name}
            </DialogTitle>
          </DialogHeader>
          <EnquiryForm
            modelName={`${selectedModel?.brandName} ${selectedModel?.name}`}
            pageType="upcoming"
            onSuccess={() => setIsEnquiryOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpcomingCars;
