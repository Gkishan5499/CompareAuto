import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
interface ArticleCardProps {
  article: any;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link to={`/news/${article.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all group h-full flex flex-col">
        <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
          {article.heroImage ? (
            <img src={article.heroImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <span className="text-6xl group-hover:scale-110 transition-transform">📰</span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">{article.category}</Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(article.date)}
            </div>
          </div>
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-xs text-muted-foreground">By {article.author}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {article.readingTime} min read
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ArticleCard;
