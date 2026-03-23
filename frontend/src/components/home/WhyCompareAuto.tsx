import { CheckCircle2, Calculator, MapPin, TrendingUp, Shield, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const WhyCompareAuto = () => {
  const features = [
    {
      icon: Calculator,
      title: "Accurate Pricing",
      description: "City-wise on-road price estimates with a clear breakup of taxes and registration charges",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: TrendingUp,
      title: "Variant Comparison",
      description: "Compare different variants side-by-side using detailed specifications and feature information",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      icon: MapPin,
      title: "Location-Based",
      description: "View pricing details and relevant information based on your selected city",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Shield,
      title: "Trusted Information",
      description: "Car specifications and pricing information from publicly available and official sources",
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Star,
      title: "Reviews & Insights",
      description: "Model insights and feedback to help you evaluate your options better",
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: CheckCircle2,
      title: "Easy Tools",
      description: "Useful tools such as EMI calculators, fuel cost estimators, and other planning utilities",
      color: "text-pink-600",
      bgColor: "bg-pink-500/10",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 max-w-7xl 2xl:max-w-[90rem]">
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
                <strong className="text-foreground">CompareAuto.in</strong> is a comprehensive car comparison platform built 
                for Indian car buyers who want clear, practical information before making a purchase. Choosing a car today is 
                not just about selecting a brand or model—it’s about finding the right variant that fits your budget, daily usage,
                and personal preferences. CompareAuto.in simplifies this process by offering detailed, variant-wise comparisons across 
                specifications, features, and pricing.
              </p>
              
              <p>
                Our platform provides city-wise on-road price estimates across India, so you can 
                understand what a car will actually cost in your city. Along with pricing details,
                CompareAuto.in offers useful tools such as an EMI calculator to plan monthly payments,
                a fuel cost estimator to assess running expenses, and an on-road price calculator that 
                includes applicable taxes and registration charges.

              </p>
              
              <p>
                Created specifically for Indian car buyers, CompareAuto.in brings together detailed specifications,
                comparison tools, and informative content in one place. Whether you are comparing hatchbacks, sedans,
                SUVs, or electric cars, our aim is to make car research simple, transparent, and easy to understand—helping 
                you choose the right car with confidence.

              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyCompareAuto;
