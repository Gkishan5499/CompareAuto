import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Breadcrumbs from "@/components/brands/Breadcrumbs";
import ArticleCard from "@/components/news/ArticleCard";
import { articlesApi, commentsApi } from "@/lib/api";
import { updateMetaTags, injectStructuredData } from "@/lib/seo";
import { Calendar, Clock, User, Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ads/AdSlot";

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentForm, setCommentForm] = useState({ name: "", email: "", content: "" });
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const art = await articlesApi.getBySlug(slug || "");
        setArticle(art);
        
        // Get all articles and filter related ones
        if (art) {
          const allArticles = await articlesApi.getAll();
          const related = allArticles
            .filter((a: any) => a.id !== art.id && a.category === art.category)
            .slice(0, 4);
          setRelatedArticles(related);
          // Load approved comments
          const c = await commentsApi.listByArticle(art.id);
          setComments(c.items || []);
        }
      } catch (err) {
        console.error("Failed to load article", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

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
        keywords: article.tags || [],
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center p-8">
          <span className="text-7xl mb-5 block opacity-50">📰</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Article not found</h2>
          <p className="text-base text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/news">
            <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/80 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-sm">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumbs */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "News", href: "/news" },
            { label: article.title },
          ]}
        />
      </div>

      {/* Ad Slot: Article Top Leaderboard */}
      <section className="py-6">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <AdSlot id="article_top_leaderboard" />
        </div>
      </section>

      {/* Hero Section */}
      <article className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Article Header */}
          <header className="mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary to-primary/90 text-white border-0 px-3 py-1 text-sm font-semibold">
              {article.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">{article.title}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatDate(article.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">{article.readingTime} min read</span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">Share:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="border-gray-300 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all font-medium"
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
                className="border-gray-300 hover:border-green-400 hover:bg-green-50 hover:text-green-600 transition-all font-medium"
              >
                <Share2 className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareTwitter}
                className="border-gray-300 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all font-medium"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Twitter
              </Button>
            </div>

            <Separator className="mt-6 bg-gray-200" />
          </header>

          {/* Hero Image */}
          <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden flex items-center justify-center mb-10 shadow-lg">
            {article.heroImage ? (
              <img
                src={article.heroImage}
                alt={article.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-9xl opacity-30">📰</span>
            )}
          </div>

          {/* Article Body */}
          <div
            className="prose prose-base prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary prose-a:font-medium prose-strong:text-gray-900 prose-li:text-gray-700 max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />

          {/* Tags */}
          <div className="mb-10">
            <h3 className="text-base font-bold text-gray-900 mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {(article.tags || []).map((tag) => (
                <Badge key={tag} variant="outline" className="px-3 py-1 text-sm font-medium border-gray-300 text-gray-700 hover:border-primary hover:text-primary transition-colors">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Comments ({comments.length})</h2>
            {comments.length === 0 && (
              <p className="text-sm text-gray-600 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">💬 No comments yet. Be the first to share your thoughts!</p>
            )}
            <div className="space-y-3 mb-8">
              {comments.map((c) => (
                <Card key={c._id} className="p-4 border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center text-white text-sm font-bold">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed pl-10">{c.content}</div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💬 Add a Comment</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-1 block" htmlFor="cname">Name *</label>
                  <input id="cname" className="w-full h-10 rounded-lg border-2 border-gray-200 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={commentForm.name} onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })} placeholder="Your name" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-1 block" htmlFor="cemail">Email *</label>
                  <input id="cemail" type="email" className="w-full h-10 rounded-lg border-2 border-gray-200 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={commentForm.email} onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })} placeholder="your@email.com" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-900 mb-1 block" htmlFor="ccontent">Comment *</label>
                <textarea id="ccontent" className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" rows={4} value={commentForm.content} onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })} placeholder="Share your thoughts..." />
              </div>
              <Button
                disabled={submittingComment}
                onClick={async () => {
                  if (!commentForm.name.trim() || !commentForm.email.trim() || !commentForm.content.trim()) return;
                  setSubmittingComment(true);
                  try {
                    await commentsApi.create({ articleId: article.id, name: commentForm.name, email: commentForm.email, content: commentForm.content });
                    setCommentForm({ name: "", email: "", content: "" });
                    const c = await commentsApi.listByArticle(article.id);
                    setComments(c.items || []);
                    toast({ title: "Comment submitted", description: "Pending admin approval." });
                  } catch (err) {
                    console.error(err);
                    toast({ title: "Failed to submit comment", variant: "destructive" });
                  } finally {
                    setSubmittingComment(false);
                  }
                }}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/80 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
              >
                {submittingComment ? "Submitting..." : "Submit Comment"}
              </Button>
              <p className="text-xs text-gray-500 mt-2">✓ Your comment will be visible once approved by admin.</p>
            </Card>
          </section>

          <Separator className="my-10 bg-gray-200" />

          {/* Author Bio */}
          {article.authorBio && (
            <Card className="p-6 mb-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-0 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">About {article.author}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {article.authorBio}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Related Articles</h2>
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
