import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrandLogo, getBrandInitial } from "@/lib/brandLogos";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

interface PhotoGalleryProps {
  photos: string[];
  modelName: string;
  brandName?: string;
}

const PhotoGallery = ({ photos, modelName, brandName }: PhotoGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const brandLogo = getBrandLogo(brandName);
  const brandInitial = getBrandInitial(brandName);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="aspect-video bg-muted rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all group"
          >
            <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform p-6">
              {photo ? (
                <img
                  src={photo}
                  alt={`${modelName} photo ${index + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // if photo fails, hide it to show fallback
                    target.style.display = "none";
                  }}
                />
              ) : brandLogo ? (
                <img src={brandLogo} alt={`${brandName} logo`} className="w-16 h-16 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground">{brandInitial}</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-5xl p-0">
          <div className="relative bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {selectedIndex !== null && (
              <>
                <div className="flex items-center justify-center min-h-[60vh] p-8">
                  {photos[selectedIndex] ? (
                    <img
                      src={photos[selectedIndex]}
                      alt={`${modelName} photo ${selectedIndex + 1}`}
                      className="max-w-full max-h-[60vh] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== DEFAULT_OG_IMAGE) target.src = DEFAULT_OG_IMAGE;
                      }}
                    />
                  ) : brandLogo ? (
                    <img
                      src={brandLogo}
                      alt={`${brandName} logo`}
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center">
                      <span className="text-5xl font-bold text-muted-foreground">{brandInitial}</span>
                    </div>
                  )}
                </div>

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
                  {selectedIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoGallery;
