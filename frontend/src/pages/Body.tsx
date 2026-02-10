import { useEffect } from "react";
import ExploreBodyTypes from "@/components/home/ExploreBodyTypes";
import { updateMetaTags } from "@/lib/seo";

const Body = () => {
  useEffect(() => {
    updateMetaTags({
      title: "Browse Cars by Body Type – Hatchback, Sedan, SUV & More | CompareAuto.in",
      description: "Explore cars by body type in India. Find hatchbacks, sedans, SUVs, MUVs, and more with prices, specs, and variant comparisons.",
      keywords: ["body type", "hatchback", "sedan", "SUV", "MUV", "coupe", "car categories"],
      canonical: "https://compareauto.in/body",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-14 md:py-20 px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-rose-50" />
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Body Style Finder
            </div>
            <h1
              className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              Find a car shape that matches your life
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl">
              Explore every body style with live variant counts. Tap a category to see
              real models, pricing, and features in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "City-friendly",
                "Family-ready",
                "Adventure",
                "Premium",
                "Electric",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ExploreBodyTypes showHeader={false} />
    </div>
  );
};

export default Body;
