import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

const LatestNews = () => {
  const newsItems = [
    {
      id: "1",
      title: "Top 10 Most Fuel-Efficient Cars in India 2024",
      excerpt: "Discover the most economical cars that save you money on every trip",
      link: "/news"
    },
    {
      id: "2", 
      title: "Upcoming Car Launches This Month",
      excerpt: "Stay updated with the latest car launches and pre-booking offers",
      link: "/upcoming-cars"
    },
    {
      id: "3",
      title: "Electric vs Petrol: Complete Cost Comparison",
      excerpt: "Find out which fuel type suits your budget and driving needs",
      link: "/news"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">📰 Latest News</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Latest Car <span className="text-primary">News & Reviews</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated on launches, reviews, and automotive news
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {newsItems.map((item, index) => (
            <Link key={item.id} to={item.link}>
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/50 hover:scale-105">
                <CardHeader className="p-6 md:p-8">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Newspaper className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg md:text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base leading-relaxed">{item.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8 pt-0">
                  <Button variant="ghost" size="sm" className="px-0 group-hover:text-primary">
                    Read More
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
