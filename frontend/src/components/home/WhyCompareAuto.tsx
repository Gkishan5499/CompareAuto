import { CheckCircle2, Calculator, MapPin, TrendingUp, Shield, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const WhyCompareAuto = () => {
  const features = [
    {
      icon: Calculator,
      title: "Accurate Pricing",
      description: "City-wise on-road prices with complete breakdown of taxes and fees",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: TrendingUp,
      title: "Variant Comparison",
      description: "Compare every variant side-by-side with detailed specifications",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      icon: MapPin,
      title: "Location-Based",
      description: "Get accurate prices and dealer information for your city",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Shield,
      title: "Trusted Information",
      description: "Verified data from official sources and expert reviews",
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Star,
      title: "User Reviews",
      description: "Real owner reviews and ratings to help you decide",
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: CheckCircle2,
      title: "Easy Tools",
      description: "EMI calculator, fuel cost estimator, and more helpful tools",
      color: "text-pink-600",
      bgColor: "bg-pink-500/10",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-sm font-medium text-primary">✨ Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Why <span className="text-primary">CompareAuto.in</span>?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              India's most comprehensive car comparison platform designed to help you make informed decisions
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-xl mb-4 ${feature.bgColor} group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Description */}
          <div className="bg-gradient-to-br from-card to-card/50 rounded-3xl p-8 md:p-12 border border-border/50 shadow-xl">
            <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg">
              <p>
                <strong className="text-foreground">CompareAuto.in</strong> is India's most comprehensive 
                car comparison platform designed to help you make informed decisions when buying your next vehicle. 
                We understand that choosing a car is more than just picking a brand or model—it's about finding 
                the perfect variant that matches your budget, lifestyle, and preferences. That's why we offer 
                detailed variant-by-variant comparisons, allowing you to explore every specification, feature, 
                and price point across multiple models.
              </p>
              
              <p>
                Our platform provides accurate, city-wise on-road prices for cars across India, ensuring you 
                know exactly what you'll pay in your location. Beyond pricing, we offer powerful tools including 
                an EMI calculator to plan your monthly payments, a fuel cost estimator to understand long-term 
                running expenses, and an on-road price calculator that factors in all taxes and registration fees. 
                Whether you're comparing hatchbacks, sedans, SUVs, or electric vehicles, we've got you covered.
              </p>
              
              <p>
                Built specifically for Indian car buyers, CompareAuto.in brings together everything you need—from 
                expert reviews and owner ratings to detailed specifications and high-quality images. Our goal is 
                to simplify your car-buying journey by providing transparent information and easy-to-use comparison 
                tools, so you can confidently choose the car that's right for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyCompareAuto;
