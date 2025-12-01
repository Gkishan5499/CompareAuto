import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Breadcrumbs from "@/components/brands/Breadcrumbs";
import ArticleCard from "@/components/news/ArticleCard";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data";
import { updateMetaTags, injectStructuredData } from "@/lib/seo";
import { Calendar, Clock, User, Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ads/AdSlot";

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const article = slug ? getArticleBySlug(slug) : undefined;
  const [copied, setCopied] = useState(false);

  const relatedArticles = article 
    ? getRelatedArticles(article.id, article.relatedIds).slice(0, 4)
    : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // SEO
  useEffect(() => {
    if (article) {
      updateMetaTags({
        title: article.title,
        description: article.excerpt,
        keywords: article.tags,
        canonical: `${window.location.origin}/news/${article.slug}`,
        ogImage: article.heroImage,
        ogType: "article",
      });

      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        image: article.heroImage,
        datePublished: article.date,
        author: {
          "@type": "Person",
          name: article.author,
        },
        publisher: {
          "@type": "Organization",
          name: "CompareAuto.in",
          logo: {
            "@type": "ImageObject",
            url: `${window.location.origin}/logo.png`,
          },
        },
      };
      injectStructuredData(structuredData);
    }
  }, [article]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Article link has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${article?.title}\n\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(article?.title || "");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Article not found</h2>
          <Link to="/news">
            <Button>View all articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "News", href: "/news" },
            { label: article.title },
          ]}
        />
      </div>

      {/* Ad Slot: Article Top Leaderboard */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <AdSlot id="article_top_leaderboard" />
        </div>
      </section>

      {/* Hero Section */}
      <article className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8">
            <Badge variant="secondary" className="mb-4">
              {article.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{article.title}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.readingTime} min read</span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Share:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareWhatsApp}
              >
                <Share2 className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareTwitter}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Twitter
              </Button>
            </div>

            <Separator className="mt-6" />
          </header>

          {/* Hero Image */}
          <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center mb-8">
            <span className="text-9xl">📰</span>
          </div>

          {/* Article Body */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />

          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Author Bio */}
          <Card className="p-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{article.author}</h3>
                <p className="text-sm text-muted-foreground">
                  Automotive journalist with expertise in Indian car market, 
                  reviews, and buying guides. Passionate about helping buyers 
                  make informed decisions.
                </p>
              </div>
            </div>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  );
};

export default NewsArticle;
