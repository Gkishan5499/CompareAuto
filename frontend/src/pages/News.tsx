import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ArticleCard from "@/components/news/ArticleCard";
import Breadcrumbs from "@/components/brands/Breadcrumbs";
import { articlesApi } from "@/lib/api";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Search, Mail } from "lucide-react";
import AdSlot from "@/components/ads/AdSlot";

const News = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("cat") || "All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.category && set.add(a.category));
    return ["All", ...Array.from(set).sort()];
  }, [articles]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await articlesApi.getAll();
        setArticles(data);
      } catch (err) {
        console.error("Failed to load articles", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter articles
  const filteredArticles = useMemo(() => {
    let result = selectedCategory === "All" 
      ? articles 
      : articles.filter((a) => a.category === selectedCategory);

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(lowerQuery) ||
          article.excerpt.toLowerCase().includes(lowerQuery) ||
          (article.tags || []).some((tag: string) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return result;
  }, [articles, selectedCategory, searchQuery]);

  // Featured article
  const featuredArticle = articles[0];

  // Editorial strips
  const buyingGuides = articles.filter(a => 
    (a.tags || []).includes("Buying Guide") || a.category === "Reviews"
  ).slice(0, 3);

  const evSpotlight = articles.filter(a => a.category === "EVs").slice(0, 3);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory !== "All") params.set("cat", selectedCategory);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, setSearchParams]);

  // SEO
  useEffect(() => {
    updateMetaTags({
      title: "Car News & Expert Reviews",
      description: "Latest Indian car launches, expert reviews, comparisons, and EV coverage. Stay updated with automobile news.",
      keywords: ["car news", "car reviews", "automobile news india", "car comparisons", "EV news"],
      canonical: `${window.location.origin}/news`,
      ogImage: DEFAULT_OG_IMAGE,
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "CompareAuto.in Car News & Reviews",
      description: "Latest car news, reviews, and buying guides for Indian car buyers",
      url: `${window.location.origin}/news`,
    };
    injectStructuredData(structuredData);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* 1) PAGE HEADER */}
      <section className="bg-gradient-to-b from-primary/5 to-background section-spacing">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "News & Reviews" },
            ]}
          />

          <h1 className="mb-4">
            Car News & Expert Reviews
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Latest launches, comparisons, and buying insights for Indian car buyers.
          </p>
        </div>
      </section>

      {/* Ad Slot: News Top Leaderboard */}
      <section className="py-4">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <AdSlot id="news_top_leaderboard" />
        </div>
      </section>

      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 section-spacing">{/* 2) CATEGORY CHIPS & SEARCH */}
        {/* 2) CATEGORY CHIPS & SEARCH */}
        <section className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                />
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform px-4 py-2"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* 4) FEATURED STORY */}
        {!loading && featuredArticle && selectedCategory === "All" && !searchQuery && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured Story</h2>
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-video md:aspect-auto bg-muted flex items-center justify-center">
                  <span className="text-9xl">📰</span>
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <Badge variant="secondary" className="w-fit mb-3">
                    {featuredArticle.category}
                  </Badge>
                  <h3 className="text-3xl font-bold mb-4">{featuredArticle.title}</h3>
                  <p className="text-muted-foreground mb-6">{featuredArticle.excerpt}</p>
                  <ul className="space-y-2 mb-6">
                    <li>✓ Comprehensive analysis</li>
                    <li>✓ Expert opinion</li>
                    <li>✓ Detailed specifications</li>
                  </ul>
                  <Button size="lg" asChild className="w-fit">
                    <a href={`/news/${featuredArticle.slug}`}>Read Full Story</a>
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* 3) ARTICLE GRID */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {searchQuery 
                ? `Search Results (${filteredArticles.length})`
                : selectedCategory === "All" 
                  ? "Latest Articles" 
                  : `${selectedCategory} (${filteredArticles.length})`
              }
            </h2>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Card key={idx} className="p-4">
                  <Skeleton className="aspect-video rounded mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredArticles.slice(0, visibleCount).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
              {filteredArticles.length > visibleCount && (
                <div className="flex justify-center mt-8">
                  <Button variant="outline" onClick={() => setVisibleCount((c) => c + 12)}>Load More</Button>
                </div>
              )}
            </>
          ) : (
            <Card className="p-12 text-center">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </section>

        {/* 5) EDITORIAL STRIPS */}
        {!searchQuery && selectedCategory === "All" && (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Buying Guides</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {buyingGuides.slice(0, 3).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>

            {evSpotlight.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">EV Spotlight</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {evSpotlight.slice(0, 3).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* 6) NEWSLETTER / FOLLOW */}
        <section className="mb-12">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="max-w-2xl mx-auto text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-semibold mb-3">
                Stay Updated with Car News
              </h2>
              <p className="text-muted-foreground mb-6">
                Get the latest car launches, reviews, and buying guides delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                  disabled
                />
                <Button disabled>
                  Subscribe
                  <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>Follow us:</span>
                <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                <a href="#" className="hover:text-primary transition-colors">Facebook</a>
                <a href="#" className="hover:text-primary transition-colors">Instagram</a>
              </div>
            </div>
          </Card>
        </section>

        {/* FAQ MINI-ACCORDION */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How often is content updated?</AccordionTrigger>
              <AccordionContent>
                We publish new articles, reviews, and comparisons multiple times per week. 
                Breaking news and major launches are covered as soon as they happen. 
                Subscribe to our newsletter to stay updated with the latest content.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What is your review methodology?</AccordionTrigger>
              <AccordionContent>
                Our reviews are based on extensive test drives covering city, highway, 
                and where applicable, off-road conditions. We evaluate design, features, 
                performance, comfort, safety, and value for money. All opinions are unbiased 
                and independent.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Are prices mentioned accurate?</AccordionTrigger>
              <AccordionContent>
                Prices mentioned in our articles are approximate and based on ex-showroom 
                rates at the time of publication. On-road prices vary by city due to different 
                RTO and tax rates. Always check with your local dealer for the most current 
                pricing and offers.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};

export default News;
