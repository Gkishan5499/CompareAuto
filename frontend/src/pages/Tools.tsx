import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Calculator, DollarSign, Fuel, User } from "lucide-react";
import ToolTile from "@/components/tools/ToolTile";
import EMICalculatorSection from "@/components/tools/EMICalculatorSection";
import OnRoadPriceEstimator from "@/components/tools/OnRoadPriceEstimator";
import FuelCostEstimator from "@/components/tools/FuelCostEstimator";
import PersonaBuilderCTA from "@/components/tools/PersonaBuilderCTA";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";

const Tools = () => {
  useEffect(() => {
    updateMetaTags({
      title: "Car Tools – EMI, On-Road Price & Fuel Cost | CompareAuto.in",
      description: "Calculate EMI, estimate on-road prices by city, and plan monthly fuel costs. Persona Builder coming soon.",
      keywords: ["car EMI calculator", "on-road price calculator", "fuel cost estimator", "car tools India"],
      canonical: `${window.location.origin}/tools`,
      ogImage: DEFAULT_OG_IMAGE,
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Car Tools",
      description: "Plan your purchase with quick calculators and price estimates by city.",
      url: `${window.location.origin}/tools`,
      applicationCategory: "FinanceApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
    };
    injectStructuredData(structuredData);
  }, []);

  const tools = [
    {
      id: "emi",
      title: "EMI Calculator",
      description: "Calculate monthly loan payments",
      icon: Calculator,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "onroad",
      title: "On-Road Price",
      description: "Get price breakup by city",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "fuel",
      title: "Fuel Cost",
      description: "Estimate monthly expenses",
      icon: Fuel,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "persona",
      title: "Persona Builder",
      description: "AI-powered recommendations",
      icon: User,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      comingSoon: true,
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* PAGE HEADER */}
      <section className="bg-gradient-to-b from-primary/5 to-background section-spacing">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-4">Car Tools</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Plan your purchase with quick calculators and price estimates by city.
            </p>
          </div>
        </div>
      </section>

      {/* TOOL TILES */}
      <section className="subsection-spacing border-b">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <ToolTile
                key={tool.id}
                {...tool}
                onClick={() => scrollToSection(tool.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* EMI CALCULATOR */}
      <section id="section-emi" className="subsection-spacing border-b scroll-mt-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="mb-3">EMI Calculator</h2>
              <p className="text-muted-foreground">
                Calculate your monthly car loan payments with adjustable parameters
              </p>
            </div>
            <EMICalculatorSection />
          </div>
        </div>
      </section>

      {/* ON-ROAD PRICE ESTIMATOR */}
      <section id="section-onroad" className="subsection-spacing border-b scroll-mt-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="mb-3">On-Road Price Estimator</h2>
              <p className="text-muted-foreground">
                Get complete price breakup including RTO, insurance, and other charges
              </p>
            </div>
            <OnRoadPriceEstimator />
          </div>
        </div>
      </section>

      {/* FUEL COST ESTIMATOR */}
      <section id="section-fuel" className="subsection-spacing border-b scroll-mt-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="mb-3">Fuel Cost Estimator</h2>
              <p className="text-muted-foreground">
                Estimate your monthly and annual fuel expenses
              </p>
            </div>
            <FuelCostEstimator />
          </div>
        </div>
      </section>

      {/* PERSONA BUILDER CTA */}
      <section id="section-persona" className="subsection-spacing scroll-mt-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <PersonaBuilderCTA />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tools;
