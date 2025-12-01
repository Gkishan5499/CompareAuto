import { Card } from "@/components/ui/card";

interface AdSlotProps {
  id: string;
  sizeMap?: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
  className?: string;
}

// Ad image mappings based on slot type
const AD_IMAGES = {
  leaderboard: {
    desktop: "/ads/leaderboard_970x90.png",
    mobile: "/ads/leaderboard_mobile_320x100.png",
  },
  billboard: {
    desktop: "/ads/billboard_970x250.png",
    mobile: "/ads/leaderboard_mobile_320x100.png",
  },
  sidebar: {
    desktop: "/ads/sidebar_300x250.png",
    mobile: "/ads/leaderboard_mobile_320x100.png",
  },
  default: {
    desktop: "/ads/leaderboard_970x90.png",
    mobile: "/ads/leaderboard_mobile_320x100.png",
  },
};

const AdSlot = ({ id, sizeMap, className = "" }: AdSlotProps) => {
  // Determine ad type from ID
  const getAdType = (): keyof typeof AD_IMAGES => {
    if (id.includes("leaderboard") || id.includes("banner")) return "leaderboard";
    if (id.includes("billboard")) return "billboard";
    if (id.includes("sidebar")) return "sidebar";
    return "default";
  };

  const adType = getAdType();
  const images = AD_IMAGES[adType];

  return (
    <div
      id={`ad-slot-${id}`}
      className={`ad-slot-placeholder overflow-hidden ${className}`}
      data-ad-slot={id}
      data-sizes={JSON.stringify(sizeMap || {})}
    >
      {/* Desktop Ad */}
      <img
        src={images.desktop}
        alt="Advertisement"
        className="hidden md:block w-full h-auto max-w-full mx-auto"
        loading="lazy"
      />
      
      {/* Mobile Ad */}
      <img
        src={images.mobile}
        alt="Advertisement"
        className="block md:hidden w-full h-auto max-w-full mx-auto"
        loading="lazy"
      />
    </div>
  );
};

export default AdSlot;
