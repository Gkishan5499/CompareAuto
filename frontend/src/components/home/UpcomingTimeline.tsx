import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Calendar, IndianRupee } from "lucide-react";
import { modelsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatINR } from "@/lib/guards";

const UpcomingTimeline = () => {
  const { data: upcomingModels = [], isLoading } = useQuery({
    queryKey: ["models", "upcoming"],
    queryFn: () => modelsApi.getUpcoming(6),
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && upcomingModels.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 md:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-sm font-medium text-primary">🚀 Upcoming</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              Upcoming <span className="text-primary">Cars</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Cars launching soon in India
            </p>
          </div>
          <Link to="/upcoming-cars">
            <Button variant="outline" size="lg" className="group">
              View All
              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {upcomingModels.map((model: any) => (
              <Link key={model.id} to="/upcoming-cars">
                <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/50">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-xs md:text-sm text-muted-foreground mb-1 font-medium">{model.brandName || model.brandId?.name}</p>
                        <h3 className="text-lg md:text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                          {model.name}
                        </h3>
                      </div>
                      <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-700 border border-orange-500/30 font-semibold">
                        Upcoming
                      </Badge>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-lg bg-muted/50">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">{model.launchWindow || model.expectedLaunch || "Coming Soon"}</span>
                      </div>
                      {model.expectedPriceMin && (
                        <div className="flex items-center gap-2 font-bold text-primary p-2 rounded-lg bg-primary/10">
                          <IndianRupee className="h-4 w-4" />
                          <span>
                            {formatINR(model.expectedPriceMin, true)}
                            {model.expectedPriceMax && ` - ${formatINR(model.expectedPriceMax, true)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingTimeline;
