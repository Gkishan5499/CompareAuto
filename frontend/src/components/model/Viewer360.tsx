import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCw, Info } from "lucide-react";
import { getBrandLogo, getBrandInitial } from "@/lib/brandLogos";

interface Viewer360Props {
  spinFrames?: string[];
  spin360Url?: string;
  modelName: string;
  brandName?: string;
}

const Viewer360 = ({ spinFrames, spin360Url, modelName, brandName }: Viewer360Props) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const brandLogo = getBrandLogo(brandName);
  const brandInitial = getBrandInitial(brandName);

  // Sprite mode: render array of frames
  const hasSpriteMode = spinFrames && spinFrames.length > 0;
  // Iframe mode: render embedded 360 viewer
  const hasIframeMode = !hasSpriteMode && spin360Url;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasSpriteMode) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentFrame((prev) => (prev - 1 + spinFrames.length) % spinFrames.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentFrame((prev) => (prev + 1) % spinFrames.length);
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [hasSpriteMode, spinFrames]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!hasSpriteMode) return;
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !hasSpriteMode) return;

    const deltaX = e.clientX - startX;
    const sensitivity = 5; // pixels per frame
    const frameChange = Math.floor(Math.abs(deltaX) / sensitivity);

    if (frameChange > 0) {
      const direction = deltaX > 0 ? 1 : -1;
      setCurrentFrame((prev) => {
        const newFrame = prev + direction * frameChange;
        return ((newFrame % spinFrames.length) + spinFrames.length) % spinFrames.length;
      });
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Sprite Mode Renderer
  if (hasSpriteMode) {
    return (
      <Card className="relative overflow-hidden bg-muted/30">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <RotateCw className="h-3 w-3" />
            360° View
          </Badge>
          <Badge variant="outline" className="text-xs">
            Drag to rotate
          </Badge>
        </div>

        <div
          ref={containerRef}
          className="aspect-video flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          tabIndex={0}
          role="img"
          aria-label={`360 degree view of ${modelName}, frame ${currentFrame + 1} of ${spinFrames.length}`}
        >
          {/* Placeholder for frames - in production these would be real images */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="text-center">
              {brandLogo ? (
                <img 
                  src={brandLogo} 
                  alt={`${brandName} logo`}
                  className="w-32 h-32 mx-auto mb-4 object-contain"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl font-bold text-muted-foreground">
                    {brandInitial}
                  </span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Frame {currentFrame + 1} / {spinFrames.length}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Use arrow keys or drag to rotate
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Iframe Mode Renderer
  if (hasIframeMode) {
    return (
      <Card className="relative overflow-hidden bg-muted/30">
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="secondary" className="flex items-center gap-1">
            <RotateCw className="h-3 w-3" />
            360° View
          </Badge>
        </div>

        <div className="aspect-video">
          <iframe
            ref={iframeRef}
            src={spin360Url}
            title={`360 degree view of ${modelName}`}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </Card>
    );
  }

  // Fallback: Coming Soon
  return (
    <Card className="aspect-video bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center">
      <div className="text-center space-y-4">
        <span className="text-6xl block">🔄</span>
        <div>
          <p className="text-lg font-medium">360° View Coming Soon</p>
          <p className="text-sm text-muted-foreground">
            Interactive spin will be available shortly
          </p>
        </div>
      </div>
    </Card>
  );
};

export default Viewer360;
