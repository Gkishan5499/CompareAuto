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
      <section className="bg-gradient-to-r from-gray-100 via-slate-200 to-gray-200 py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "News & Reviews" },
            ]}
          />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4 leading-tight">
            Car News & Expert Reviews
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl font-light leading-relaxed">
            Latest launches, comparisons, and buying insights for Indian car buyers.
          </p>
        </div>
      </section>

      {/* Ad Slot: News Top Leaderboard
      <section className="py-4">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <AdSlot id="news_top_leaderboard" />
        </div>
      </section> */}

      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12">
        {/* 2) CATEGORY CHIPS & SEARCH */}
        <section className="mb-12">
          <Card className="p-6 lg:p-8 shadow-lg border-0">
            <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <Input
                  type="text"
                  placeholder="Search articles by title or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-3 text-base border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  maxLength={100}
                />
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-3 lg:justify-end">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer transition-all px-4 py-2 text-sm font-medium ${selectedCategory === category
                        ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-md"
                        : "border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                      }`}
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
          <section className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-gray-900">Featured Story</h2>
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
              <div className="grid md:grid-cols-2 gap-0">
                {/* <div className="aspect-video md:aspect-auto bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                  <span className="text-9xl opacity-20">📰</span>
                </div> */}
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {featuredArticle.heroImage ? (
                    <img src={featuredArticle.heroImage} alt={featuredArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-6xl group-hover:scale-110 transition-transform">📰</span>
                  )}
                </div>


                <div className="p-8 lg:p-10 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
                  <Badge variant="secondary" className="w-fit mb-4 bg-gradient-to-r from-primary to-primary/90 text-white border-0 px-3 py-1 text-sm font-semibold">
                    {featuredArticle.category}
                  </Badge>
                  <h3 className="text-3xl lg:text-4xl font-bold mb-5 text-gray-900 leading-tight">{featuredArticle.title}</h3>
                  <p className="text-gray-600 mb-6 text-base lg:text-lg leading-relaxed">{featuredArticle.excerpt}</p>
                  <div className="mb-8 space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-primary font-bold text-lg">✓</span>
                      <span className="font-medium">Comprehensive analysis</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-primary font-bold text-lg">✓</span>
                      <span className="font-medium">Expert opinion</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-primary font-bold text-lg">✓</span>
                      <span className="font-medium">Detailed specifications</span>
                    </div>
                  </div>
                  <Button size="lg" asChild className="w-fit bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/80 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all">
                    <a href={`/news/${featuredArticle.slug}`}>Read Full Story →</a>
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* 3) ARTICLE GRID */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {searchQuery
                  ? `Search Results`
                  : selectedCategory === "All"
                    ? "Latest Articles"
                    : selectedCategory
                }
              </h2>
              {filteredArticles.length > 0 && (
                <p className="text-gray-500 text-lg font-medium">
                  {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
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
                <div className="flex justify-center mt-12">
                  <Button onClick={() => setVisibleCount((c) => c + 12)} className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/80 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all">
                    Load More Articles
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="p-16 text-center border-2 border-dashed border-gray-300 bg-gray-50">
              <span className="text-7xl mb-6 block opacity-50">🔍</span>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">No articles found</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/80 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Clear All Filters
              </Button>
            </Card>
          )}
        </section>

        {/* 5) EDITORIAL STRIPS */}
        {!searchQuery && selectedCategory === "All" && (
          <>
            <section className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-gray-900">Buying Guides</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {buyingGuides.slice(0, 3).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>

            {evSpotlight.length > 0 && (
              <section className="mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-gray-900">EV Spotlight</h2>
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
        <section className="mb-16">
          <Card className="p-10 lg:p-12 bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/80 border-0 shadow-xl text-white">
            <div className="max-w-2xl mx-auto text-center">
              <Mail className="h-14 w-14 mx-auto mb-6 text-white/80" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Stay Updated with Car News
              </h2>
              <p className="text-white/80 mb-8 text-lg font-light leading-relaxed">
                Get the latest car launches, reviews, and buying guides delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white/90 border-0 text-gray-900 placeholder-gray-400 py-3 px-4 focus:bg-white focus:ring-2 focus:ring-primary/20"
                  disabled
                />
                <Button disabled className="bg-gray-200 text-gray-700 hover:bg-gray-200 font-semibold">
                  Subscribe
                </Button>
              </div>
              <p className="text-white/70 text-sm font-medium mb-6">Coming Soon</p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <span className="text-white/70">Follow us:</span>
                <a href="#" className="text-white hover:text-white/80 font-semibold transition-colors">Twitter</a>
                <a href="#" className="text-white hover:text-white/80 font-semibold transition-colors">Facebook</a>
                <a href="#" className="text-white hover:text-white/80 font-semibold transition-colors">Instagram</a>
              </div>
            </div>
          </Card>
        </section>

        {/* FAQ MINI-ACCORDION */}
        <section>
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-3 max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6 py-4 hover:border-primary/50 transition-colors">
                <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:text-primary">How often is content updated?</AccordionTrigger>
                <AccordionContent className="text-gray-700 pt-4 leading-relaxed">
                  We publish new articles, reviews, and comparisons multiple times per week.
                  Breaking news and major launches are covered as soon as they happen.
                  Subscribe to our newsletter to stay updated with the latest content.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6 py-4 hover:border-primary/50 transition-colors">
                <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:text-primary">What is your review methodology?</AccordionTrigger>
                <AccordionContent className="text-gray-700 pt-4 leading-relaxed">
                  Our reviews are based on extensive test drives covering city, highway,
                  and where applicable, off-road conditions. We evaluate design, features,
                  performance, comfort, safety, and value for money. All opinions are unbiased
                  and independent.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6 py-4 hover:border-primary/50 transition-colors">
                <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:text-primary">Are prices mentioned accurate?</AccordionTrigger>
                <AccordionContent className="text-gray-700 pt-4 leading-relaxed">
                  Prices mentioned in our articles are approximate and based on ex-showroom
                  rates at the time of publication. On-road prices vary by city due to different
                  RTO and tax rates. Always check with your local dealer for the most current
                  pricing and offers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
};

export default News;
