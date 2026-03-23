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
    desktop: "/ads/leaderboard_970x90.jpeg",
    mobile: "/ads/leaderboard_mobile_320x100.jpeg",
  },
  billboard: {
    desktop: "/ads/billboard_970x250.jpeg",
    mobile: "/ads/leaderboard_mobile_320x100.jpeg",
  },
  sidebar: {
    desktop: "/ads/sidebar_300x250.jpeg",
    mobile: "/ads/leaderboard_mobile_320x100.jpeg",
  },
  default: {
    desktop: "/ads/leaderboard_970x90.jpeg",
    mobile: "/ads/leaderboard_mobile_320x100.jpeg",
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
  const desktopAspectClasses: Record<keyof typeof AD_IMAGES, string> = {
    leaderboard: "aspect-[970/90] max-w-[970px]",
    billboard: "aspect-[970/250] max-w-[970px]",
    sidebar: "aspect-[300/250] max-w-[300px]",
    default: "aspect-[970/90] max-w-[970px]",
  };

  return (
    <div
      id={`ad-slot-${id}`}
      className={`ad-slot-placeholder w-full ${className}`}
      data-ad-slot={id}
      data-sizes={JSON.stringify(sizeMap || {})}
    >
      {/* Desktop Ad */}
      <div className={`hidden md:block w-full mx-auto ${desktopAspectClasses[adType]}`}>
        <img
          src={images.desktop}
          alt="Advertisement"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      
      {/* Mobile Ad */}
      <div className="block md:hidden w-full max-w-[320px] aspect-[320/100] mx-auto">
        <img
          src={images.mobile}
          alt="Advertisement"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default AdSlot;
