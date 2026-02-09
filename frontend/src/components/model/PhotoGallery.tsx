import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrandLogo, getBrandInitial } from "@/lib/brandLogos";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

interface PhotoGalleryProps {
  photos: string[];
  modelName: string;
  brandName?: string;
  mode?: "default" | "hero";
}

const PhotoGallery = ({ photos, modelName, brandName, mode = "default" }: PhotoGalleryProps) => {
  const validPhotos = (photos || []).filter((p) => p && p.trim() !== "");
  const [selectedIndex, setSelectedIndex] = useState<number>(validPhotos.length ? 0 : 0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const brandLogo = getBrandLogo(brandName);
  const brandInitial = getBrandInitial(brandName);

  useEffect(() => {
    setSelectedIndex(validPhotos.length ? 0 : 0);
    setLightboxOpen(false);
  }, [validPhotos.length]);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const goToNext = () => {
    if (validPhotos.length > 0) {
      setSelectedIndex((selectedIndex + 1) % validPhotos.length);
    }
  };

  const goToPrevious = () => {
    if (validPhotos.length > 0) {
      setSelectedIndex((selectedIndex - 1 + validPhotos.length) % validPhotos.length);
    }
  };

  return (
    <>
      <div className={mode === "hero" ? "space-y-2" : "space-y-4"}>
        <div
          className={
            mode === "hero"
              ? "relative bg-transparent rounded-xl overflow-hidden flex items-center justify-center min-h-[280px] md:min-h-[340px] lg:min-h-[380px]"
              : "relative bg-white rounded-xl border shadow-sm overflow-hidden flex items-center justify-center min-h-[240px] md:min-h-[320px] lg:min-h-[360px]"
          }
        >
          {validPhotos.length === 0 ? (
            brandLogo ? (
              <img src={brandLogo} alt={`${brandName} logo`} className="w-24 h-24 object-contain" loading="lazy" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center">
                <span className="text-3xl font-bold text-muted-foreground">{brandInitial}</span>
              </div>
            )
          ) : (
            <>
              <img
                src={validPhotos[selectedIndex]}
                alt={`${modelName} photo`}
                className={mode === "hero" ? "w-full h-full object-contain max-h-[460px] cursor-zoom-in" : "w-full h-full object-contain max-h-[420px] cursor-zoom-in"}
                loading="lazy"
                onClick={() => openLightbox(selectedIndex)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== DEFAULT_OG_IMAGE) target.src = DEFAULT_OG_IMAGE;
                }}
              />
              {validPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    className={mode === "hero" ? "absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white rounded-full p-2 shadow" : "absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-slate-900 rounded-full p-2 shadow"}
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    className={mode === "hero" ? "absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white rounded-full p-2 shadow" : "absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-slate-900 rounded-full p-2 shadow"}
                    onClick={goToNext}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 text-xs bg-black/65 text-white px-2 py-1 rounded-full">
                    {selectedIndex + 1} / {validPhotos.length}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {validPhotos.length > 1 && (
          <div className={mode === "hero" ? "flex gap-2 overflow-x-auto pb-1 justify-center" : "flex gap-3 overflow-x-auto pb-1 justify-center"}>
            {validPhotos.map((photo, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative border rounded-lg overflow-hidden ${mode === "hero" ? "min-w-[90px] max-w-[110px]" : "min-w-[110px] max-w-[140px]"} aspect-[4/3] ${isActive ? "border-primary ring-2 ring-primary/30" : "border-muted"}`}
                >
                  <img
                    src={photo}
                    alt={`${modelName} thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0">
          <div className="relative bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {validPhotos[selectedIndex] && (
              <>
                <div className="flex items-center justify-center min-h-[60vh] p-8">
                  <img
                    src={validPhotos[selectedIndex]}
                    alt={`${modelName} photo ${selectedIndex + 1}`}
                    className="max-w-full max-h-[60vh] object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== DEFAULT_OG_IMAGE) target.src = DEFAULT_OG_IMAGE;
                    }}
                  />
                </div>

                {validPhotos.length > 1 && (
                  <>
                    <div className="absolute inset-y-0 left-4 flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={goToPrevious}
                      >
                        <ChevronLeft className="h-8 w-8" />
                      </Button>
                    </div>

                    <div className="absolute inset-y-0 right-4 flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={goToNext}
                      >
                        <ChevronRight className="h-8 w-8" />
                      </Button>
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                      {selectedIndex + 1} / {validPhotos.length}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoGallery;
