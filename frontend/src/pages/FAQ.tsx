import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  useEffect(() => {
    updateMetaTags({
      title: "FAQ – Prices, Variants, Comparisons | CompareAuto.in",
      description: "Frequently asked questions about car pricing, variant differences, comparisons, EMI calculations, and how to use CompareAuto.in effectively.",
      keywords: ["car buying FAQ", "variant questions", "price accuracy", "comparison help", "EMI calculator FAQ"],
      canonical: `${window.location.origin}/faq`,
      ogImage: DEFAULT_OG_IMAGE,
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Are the prices on CompareAuto.in accurate?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, all ex-showroom prices are sourced from official manufacturer websites and updated regularly. On-road prices are estimates that may vary by city, dealer, and current offers.",
          },
        },
        {
          "@type": "Question",
          name: "How do I compare different variants of the same model?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Visit the model page and click on the Variants tab to see a side-by-side comparison table of all available trims.",
          },
        },
      ],
    };
    injectStructuredData(structuredData);
  }, []);

  const faqSections = [
    {
      title: "Pricing & Cities",
      icon: "💰",
      questions: [
        {
          q: "Are the prices on CompareAuto.in accurate?",
          a: (
            <>
              Yes, all ex-showroom prices are sourced from official manufacturer websites and authorized dealers. We update prices regularly, but they may vary slightly by region and dealer. On-road prices are estimates—use our{" "}
              <Link to="/tools" className="text-primary hover:underline">
                On-Road Price tool
              </Link>{" "}
              to calculate the exact cost in your city.
            </>
          ),
        },
        {
          q: "Why do on-road prices differ by city?",
          a: "On-road prices include RTO registration charges, road tax, and insurance, which vary by state and city. Our calculator estimates these costs based on typical rates for each location.",
        },
        {
          q: "Do you show dealer discounts or special offers?",
          a: "We display manufacturer-announced offers and typical dealer discounts. For the latest promotions, please contact your local dealer or check their website.",
        },
        {
          q: "How often are prices updated?",
          a: "We update ex-showroom prices within 24-48 hours of manufacturer announcements. If you spot outdated pricing, please report it via our Contact page.",
        },
      ],
    },
    {
      title: "Variants & Features",
      icon: "🚗",
      questions: [
        {
          q: "How do I compare different variants of the same model?",
          a: (
            <>
              Visit the model page (e.g., <Link to="/hyundai/creta" className="text-primary hover:underline">/hyundai/creta</Link>) and click the "Compare Variants" button. You'll see a side-by-side table showing features, specs, and pricing for all trims.
            </>
          ),
        },
        {
          q: "What's the difference between a 'variant' and a 'model'?",
          a: "A model (e.g., 'Creta') is the base car. A variant (e.g., 'Creta SX Diesel AT') is a specific trim level with unique features, engine, transmission, and pricing.",
        },
        {
          q: "Can I see which features are standard vs optional?",
          a: "Yes, on each variant's detail page, the Features tab lists all available features with checkmarks for included items and crosses for unavailable ones.",
        },
        {
          q: "Why are some features missing on lower variants?",
          a: "Manufacturers offer multiple trims to meet different budgets. Lower variants typically omit premium features like sunroofs, advanced safety tech, or leather upholstery to reduce cost.",
        },
      ],
    },
    {
      title: "Comparisons",
      icon: "⚖️",
      questions: [
        {
          q: "How do I compare cars from different brands?",
          a: (
            <>
              Use the{" "}
              <Link to="/compare" className="text-primary hover:underline">
                Compare page
              </Link>{" "}
              to select up to 3 cars from any brand. You'll see specs, features, pricing, and pros/cons side-by-side.
            </>
          ),
        },
        {
          q: "Can I compare more than 3 cars at once?",
          a: "Currently, you can compare up to 3 cars at a time for readability. To compare additional models, create a new comparison or save your results and start fresh.",
        },
        {
          q: "What does the 'Add to Compare' button do?",
          a: "Clicking 'Add to Compare' on a model or variant page adds it to your comparison list. Access your list anytime via the sticky Compare Bar at the bottom of the screen.",
        },
        {
          q: "How do I remove a car from my comparison list?",
          a: "Open the Compare Bar (bottom of the page) and click the 'X' icon next to the car you want to remove.",
        },
      ],
    },
    {
      title: "Images & Colors",
      icon: "🎨",
      questions: [
        {
          q: "Why are some car images placeholders?",
          a: "We're continuously adding high-quality images for all models and variants. If a specific variant photo is missing, it will be updated soon. Placeholder icons represent the general body type.",
        },
        {
          q: "Can I see all available colors for a variant?",
          a: "Yes, visit the variant detail page and navigate to the 'Colors' tab to see all available color options for that specific trim.",
        },
        {
          q: "Do color options vary by variant?",
          a: "Yes, some exclusive colors are only available on higher trims. Check the Colors tab on each variant page to see which shades are offered.",
        },
      ],
    },
    {
      title: "Data Accuracy & Tools",
      icon: "✅",
      questions: [
        {
          q: "How accurate is the EMI calculator?",
          a: (
            <>
              Our{" "}
              <Link to="/tools" className="text-primary hover:underline">
                EMI Calculator
              </Link>{" "}
              uses standard loan formulas to provide estimates. Actual EMI may vary based on your credit score, bank policies, and down payment. Contact your bank for precise rates.
            </>
          ),
        },
        {
          q: "Can I calculate fuel costs for electric vehicles?",
          a: (
            <>
              Yes, our{" "}
              <Link to="/tools" className="text-primary hover:underline">
                Fuel Cost Estimator
              </Link>{" "}
              includes an EV mode. Switch to Electric Vehicle, enter your efficiency (Wh/km), and electricity rate to estimate charging costs.
            </>
          ),
        },
        {
          q: "What if I find incorrect information?",
          a: (
            <>
              Please report it via our{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact page
              </Link>
              . Include the model/variant name, the incorrect detail, and the correct information with a source (official brochure, dealer confirmation, etc.).
            </>
          ),
        },
        {
          q: "Do you provide test drive booking?",
          a: "Not directly. However, each model page includes a link to the manufacturer's official website where you can request a test drive or find nearby dealers.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
              <Badge variant="secondary">FAQ</Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Find answers to common questions about pricing, variants, comparisons, and using CompareAuto.in.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTIONS */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {faqSections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{section.icon}</span>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`section-${sectionIndex}-item-${itemIndex}`}>
                      <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* STILL NEED HELP */}
      <section className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find the answer you're looking for? Our support team is here to assist you.
            </p>
            <Link to="/contact">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-base px-6 py-3">
                Contact Support →
              </Badge>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
