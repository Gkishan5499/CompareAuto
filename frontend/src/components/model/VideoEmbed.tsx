import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

interface VideoEmbedProps {
  videoUrl: string;
  title: string;
}

const VideoEmbed = ({ videoUrl, title }: VideoEmbedProps) => {
  // Parse YouTube and Vimeo URLs to get embed-friendly formats
  const getEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);

      // YouTube handling
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
        let videoId = "";
        
        if (urlObj.hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.slice(1);
        } else if (urlObj.searchParams.has("v")) {
          videoId = urlObj.searchParams.get("v") || "";
        }

        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null;
      }

      // Vimeo handling
      if (urlObj.hostname.includes("vimeo.com")) {
        const videoId = urlObj.pathname.split("/").filter(Boolean)[0];
        return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
      }

      return null;
    } catch {
      return null;
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <Card className="aspect-video bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="text-6xl block">🎥</span>
          <div>
            <p className="text-lg font-medium">Video Not Available</p>
            <p className="text-sm text-muted-foreground">
              Unable to load video content
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-muted/30">
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Play className="h-3 w-3" />
          Official Video
        </Badge>
      </div>

      <div className="aspect-video">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </Card>
  );
};

export default VideoEmbed;
