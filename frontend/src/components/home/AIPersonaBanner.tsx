import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AIPersonaBanner = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary via-primary-dark to-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-12 w-12 md:h-16 text-white animate-pulse" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-white mb-3">Let AI pick your perfect variant</h2>
                <p className="text-white/90 text-lg mb-6">
                  Coming soon — an AI flow that learns your habits and recommends the right trim,
                  features, and price point tailored just for you.
                </p>
                <Link to="/tools">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="group"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIPersonaBanner;
