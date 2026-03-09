import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useApiList, useApiDelete } from "../../hooks/useapi";
import { Edit, Trash2, Plus, Search, Filter } from "lucide-react";
import dayjs from "dayjs";

interface Article {
  _id: string;
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  heroImage?: string;
  slug?: string;
}

export default function ArticleList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const { data, isLoading } = useApiList<Article[]>(["articles"], "/api/articles");
  const deleteArticle = useApiDelete(["articles"], "/api/articles");

  const articles = data || [];
  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.category && set.add(a.category));
    return ["All", ...Array.from(set).sort()];
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || a.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [articles, search, category]);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this article?")) {
      await deleteArticle.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-muted-foreground">Manage blog posts and news articles.</p>
        </div>
        <Button onClick={() => navigate("/articles/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Article
        </Button>
      </div>

      <Card className="p-4">
        <div className="mb-6 grid md:grid-cols-2 gap-3">
          <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select className="h-10 border rounded px-2 bg-white" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && <div>Loading articles...</div>}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No articles found
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((article) => (
              <div key={article._id} className="border rounded-lg overflow-hidden bg-white">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {article.heroImage ? (
                    <img src={article.heroImage} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">📰</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <span className="text-xs text-muted-foreground">{dayjs(article.date).format("DD MMM YYYY")}</span>
                  </div>
                  <h3 className="font-semibold line-clamp-2 min-h-12">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">By {article.author}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/articles/${article.id}/edit`)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
