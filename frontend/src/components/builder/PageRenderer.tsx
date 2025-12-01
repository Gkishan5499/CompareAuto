import { useMemo } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeroSearch from "@/components/home/HeroSearch";
import BodyTypesStrip from "@/components/home/BodyTypesStrip";
import FuelTypeStrip from "@/components/home/FuelTypeStrip";
import NewLaunches from "@/components/home/NewLaunches";
import UpcomingTimeline from "@/components/home/UpcomingTimeline";
import BrandsStrip from "@/components/home/BrandsStrip";
import TrendingComparisons from "@/components/home/TrendingComparisons";
import QuickToolsRibbon from "@/components/home/QuickToolsRibbon";
import AdSlot from "@/components/ads/AdSlot";

interface PageSection {
  type: string;
  props: Record<string, any>;
}

interface PageRendererProps {
  sections: PageSection[];
}

/**
 * PageRenderer - Dynamically renders page sections from JSON config
 */
const PageRenderer = ({ sections }: PageRendererProps) => {
  const renderedSections = useMemo(() => {
    return sections.map((section, index) => {
      const key = `${section.type}-${index}`;

      switch (section.type) {
        case "Hero":
          return (
            <section key={key} className="py-12 bg-gradient-to-b from-primary/5 to-background">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl">
                  <h1 className="mb-4">{section.props.title}</h1>
                  {section.props.subtitle && (
                    <p className="text-lg text-muted-foreground">{section.props.subtitle}</p>
                  )}
                  {section.props.cta && section.props.ctaHref && (
                    <Button asChild className="mt-6">
                      <Link to={section.props.ctaHref}>{section.props.cta}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </section>
          );

        case "RichText":
          return (
            <section key={key} className="py-12 bg-background">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto prose prose-slate">
                  <ReactMarkdown>{section.props.md || ""}</ReactMarkdown>
                </div>
              </div>
            </section>
          );

        case "CardsGrid":
          return (
            <section key={key} className="py-12 bg-background">
              <div className="container mx-auto px-4">
                {section.props.title && <h2 className="text-2xl font-bold mb-6">{section.props.title}</h2>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(section.props.items || []).map((item: any, i: number) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          );

        case "HeroSearch":
          return <HeroSearch key={key} />;

        case "BodyTypesStrip":
          return <BodyTypesStrip key={key} />;

        case "FuelTypesStrip":
        case "FuelTypeStrip":
          return <FuelTypeStrip key={key} />;

        case "NewLaunches":
          return <NewLaunches key={key} />;

        case "UpcomingPreview":
        case "UpcomingTimeline":
          return <UpcomingTimeline key={key} />;

        case "BrandsGrid":
        case "BrandsStrip":
          return <BrandsStrip key={key} />;

        case "CompareTeaser":
        case "TrendingComparisons":
          return <TrendingComparisons key={key} />;

        case "ToolsStrip":
        case "QuickToolsRibbon":
          return <QuickToolsRibbon key={key} />;

        case "AdSlot":
          return (
            <section key={key} className="py-4">
              <div className="container mx-auto px-4">
                <AdSlot
                  id={section.props.id || `ad-${index}`}
                  sizeMap={section.props.sizeMap || { desktop: "728x90", mobile: "320x50" }}
                />
              </div>
            </section>
          );

        case "CTA":
          return (
            <section key={key} className="py-12 bg-muted/30">
              <div className="container mx-auto px-4 text-center">
                <Button asChild variant={section.props.variant || "default"} size="lg">
                  <Link to={section.props.href}>{section.props.label}</Link>
                </Button>
              </div>
            </section>
          );

        default:
          console.warn(`Unknown section type: ${section.type}`);
          return null;
      }
    });
  }, [sections]);

  return <>{renderedSections}</>;
};

export default PageRenderer;
