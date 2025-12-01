import { Link } from "react-router-dom";
import { Calculator, FileText, Fuel, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

const TOOLS = [
  {
    title: "EMI Calculator",
    description: "Calculate your monthly car loan payments instantly",
    icon: Calculator,
    path: "/tools",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "On-Road Price",
    description: "Get complete price breakdown by city",
    icon: FileText,
    path: "/tools",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    title: "Fuel Cost Calculator",
    description: "Estimate your monthly fuel expenses",
    icon: Fuel,
    path: "/tools",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Upcoming Cars",
    description: "Stay updated on new launches and models",
    icon: Calendar,
    path: "/tools",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

const QuickToolsRibbon = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">🛠️ Quick Tools</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Quick <span className="text-primary">Tools</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Make informed decisions with our comprehensive car buying tools
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.title} to={tool.path}>
                <Card className="p-6 md:p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group h-full bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/50">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${tool.bgColor} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className={`h-8 w-8 md:h-10 md:w-10 ${tool.color}`} />
                  </div>
                  <h5 className="text-lg md:text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h5>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{tool.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickToolsRibbon;
