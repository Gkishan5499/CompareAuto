import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUpcomingModels } from "@/lib/data";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Calendar, IndianRupee } from "lucide-react";
import { formatINR } from "@/lib/guards";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const UpcomingCars = () => {
  const upcomingModels = getUpcomingModels();
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

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
