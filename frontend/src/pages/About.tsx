import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Target, Zap, Shield, ArrowRight } from "lucide-react";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";

const About = () => {
  useEffect(() => {
    updateMetaTags({
      title: "About CompareAuto.in – India's Variant-wise Car Guide",
      description: "Learn how CompareAuto.in helps Indian car buyers research models, compare variants, and make informed decisions with accurate pricing and specifications.",
      keywords: ["about CompareAuto", "car comparison platform India", "variant guide", "car buying help"],
      canonical: `${window.location.origin}/about`,
      ogImage: DEFAULT_OG_IMAGE,
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "CompareAuto.in",
      description: "India's comprehensive variant-wise car comparison platform",
      url: window.location.origin,
      logo: `${window.location.origin}/logo.png`,
      sameAs: [
        "https://twitter.com/compareauto",
        "https://facebook.com/compareauto",
      ],
    };
    injectStructuredData(structuredData);
  }, []);

  const values = [
    {
      icon: CheckCircle2,
      title: "Accuracy",
      description: "Verified specs and pricing from official sources, updated regularly to reflect market changes.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Shield,
      title: "Transparency",
      description: "Clear breakdowns of features, prices, and comparisons without hidden agendas or sponsored rankings.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Zap,
      title: "Speed",
      description: "Quick access to variant details, instant comparisons, and efficient tools to accelerate your research.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const howWeHelp = [
    {
      title: "Research Models",
      description: "Browse all brands and models with detailed specifications, photos, and expert reviews.",
    },
    {
      title: "Explore Variants",
      description: "Compare every variant of a model side-by-side to find the perfect trim level for your needs.",
    },
    {
      title: "Compare Choices",
      description: "Add up to 3 cars to compare features, pricing, and value across different segments.",
    },
    {
      title: "Use Smart Tools",
      description: "Calculate EMI, estimate on-road prices by city, and plan fuel costs with our free calculators.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">About Us</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">About CompareAuto.in</h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              We're India's most comprehensive variant-wise car comparison platform, helping millions of buyers research, compare, and choose the right car with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-12 md:py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Buying a car in India means navigating dozens of variants, confusing pricing, and endless dealer visits. We believe every buyer deserves transparent, accurate information to make the best choice. CompareAuto.in cuts through the noise by presenting every variant, every feature, and every price point in one place—so you can research smarter and decide faster.
            </p>

            {/* Value Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="p-6">
                  <div className={`${value.bgColor} ${value.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE HELP */}
      <section className="py-12 md:py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How We Help You</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {howWeHelp.map((item, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IMAGE BAND */}
      <section className="py-12 md:py-16 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12 md:p-16">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3">
                Over 50+ Brands, 500+ Models, 2000+ Variants
              </h3>
              <p className="text-muted-foreground">
                Continuously updated with the latest launches and pricing across India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DISCLOSURE & DATA SOURCES */}
      <section className="py-12 md:py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Data Sources & Disclosure</h2>
            <Card className="p-6 bg-muted/30">
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Pricing:</strong> All ex-showroom prices are sourced from official manufacturer websites and authorized dealer networks. On-road prices are estimates and may vary by city, dealer, and current offers.
                </p>
                <p>
                  <strong className="text-foreground">Specifications:</strong> Technical data is compiled from official brochures and press releases. We strive for accuracy but recommend verifying critical details with your local dealer.
                </p>
                <p>
                  <strong className="text-foreground">Reviews & Ratings:</strong> Editorial reviews reflect our independent assessment. User reviews are moderated but represent individual opinions.
                </p>
                <p>
                  <strong className="text-foreground">Affiliate Disclosure:</strong> CompareAuto.in may earn commissions from dealer referrals and partner links. This does not influence our editorial content or comparison rankings.
                </p>
                <p className="text-xs pt-2 border-t">
                  Last updated: January 2025. For corrections or data inquiries, please{" "}
                  <Link to="/contact" className="text-primary hover:underline">
                    contact us
                  </Link>.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 p-8 md:p-12">
              <div className="text-center space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold">Ready to Find Your Perfect Car?</h2>
                <p className="text-muted-foreground">
                  Start exploring brands, compare variants, or use our tools to plan your purchase.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/brands">
                    <Button size="lg" className="w-full sm:w-auto">
                      Explore Brands
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/compare">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Compare Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
