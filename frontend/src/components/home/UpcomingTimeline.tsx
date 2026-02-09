import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Calendar, IndianRupee, Zap } from "lucide-react";
import { upcomingCarsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatINR } from "@/lib/guards";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const UpcomingTimeline = () => {
  const { data: upcomingCars = [], isLoading } = useQuery({
    queryKey: ["upcoming-cars"],
    queryFn: () => upcomingCarsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && upcomingCars.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 max-w-7xl">
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
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="relative px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {upcomingCars.map((car: any) => (
                  <CarouselItem key={car.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Link to={`/upcoming-cars`}>
                      <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/50 h-full">
                        <CardContent className="p-0">
                          {/* Car Image */}
                          {car.image && (
                            <div className="relative h-48 overflow-hidden rounded-t-lg">
                              <img
                                src={car.image}
                                alt={car.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              <div className="absolute top-3 right-3">
                                <Badge variant="secondary" className="bg-gradient-to-r from-orange-500/90 to-red-500/90 text-white border-0 font-semibold backdrop-blur-sm">
                                  Upcoming
                                </Badge>
                              </div>
                            </div>
                          )}
                          
                          {/* Car Details */}
                          <div className="p-6">
                            <div className="mb-4">
                              <p className="text-xs md:text-sm text-muted-foreground mb-1 font-medium">
                                {car.brandName}
                              </p>
                              <h3 className="text-lg md:text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                {car.name}
                              </h3>
                            </div>

                            <div className="space-y-3 text-sm">
                              {/* Launch Date */}
                              <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-lg bg-muted/50">
                                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="font-medium truncate">
                                  {car.launchWindow || (car.expectedLaunch ? new Date(car.expectedLaunch).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : "Coming Soon")}
                                </span>
                              </div>

                              {/* Expected Price */}
                              {car.expectedPriceMin && (
                                <div className="flex items-center gap-2 font-bold text-primary p-2 rounded-lg bg-primary/10">
                                  <IndianRupee className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {formatINR(car.expectedPriceMin, true)}
                                    {car.expectedPriceMax && car.expectedPriceMax !== car.expectedPriceMin && ` - ${formatINR(car.expectedPriceMax, true)}`}
                                  </span>
                                </div>
                              )}

                              {/* Fuel Types */}
                              {car.fuelTypes && car.fuelTypes.length > 0 && (
                                <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-lg bg-muted/50">
                                  <Zap className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                  <span className="text-xs truncate">{car.fuelTypes.join(", ")}</span>
                                </div>
                              )}

                              {/* Body Type */}
                              {car.bodyType && (
                                <div className="text-xs text-muted-foreground">
                                  <Badge variant="outline" className="font-normal">{car.bodyType}</Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-6" />
              <CarouselNext className="-right-6" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingTimeline;
