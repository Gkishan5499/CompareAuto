import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ArticleCard from "@/components/news/ArticleCard";
import { articlesApi } from "@/lib/api";

const LatestNews = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await articlesApi.getAll();
        setItems(data.slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
          {loading ? (
            [0,1,2].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="aspect-video rounded mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))
          ) : (
            items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
