// SEO utility functions for meta tags and structured data

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

export const updateMetaTags = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = "website",
  noindex = false,
}: SEOProps) => {
  // Update title
  document.title = `${title} | CompareAuto.in`;

  // Update or create meta tags
  const updateMeta = (name: string, content: string, property?: boolean) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let element = document.querySelector(selector);
    
    if (!element) {
      element = document.createElement("meta");
      if (property) {
        element.setAttribute("property", name);
      } else {
        element.setAttribute("name", name);
      }
      document.head.appendChild(element);
    }
    
    element.setAttribute("content", content);
  };

  // Basic meta tags
  updateMeta("description", description);
  if (keywords && keywords.length > 0) {
    updateMeta("keywords", keywords.join(", "));
  }

  // Open Graph tags
  updateMeta("og:title", title, true);
  updateMeta("og:description", description, true);
  updateMeta("og:type", ogType, true);
  if (ogImage) {
    updateMeta("og:image", ogImage, true);
  }

  // Twitter Card tags
  updateMeta("twitter:card", "summary_large_image");
  updateMeta("twitter:title", title);
  updateMeta("twitter:description", description);
  if (ogImage) {
    updateMeta("twitter:image", ogImage);
  }

  // Canonical URL
  if (canonical) {
    let linkElement = document.querySelector('link[rel="canonical"]');
    if (!linkElement) {
      linkElement = document.createElement("link");
      linkElement.setAttribute("rel", "canonical");
      document.head.appendChild(linkElement);
    }
    linkElement.setAttribute("href", canonical);
  }

  // Robots meta
  if (noindex) {
    updateMeta("robots", "noindex, nofollow");
  } else {
    updateMeta("robots", "index, follow");
  }
};

// JSON-LD Structured Data Builders

export const generateBrandSchema = (brand: { name: string; logo: string; url: string }) => {
  return {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    logo: brand.logo,
    url: brand.url,
  };
};

export const generateProductSchema = (vehicle: {
  name: string;
  brand: string;
  image: string;
  description: string;
  price: number;
  currency?: string;
  availability?: string;
  url: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: vehicle.name,
    brand: {
      "@type": "Brand",
      name: vehicle.brand,
    },
    image: vehicle.image,
    description: vehicle.description,
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: vehicle.currency || "INR",
      availability: vehicle.availability || "https://schema.org/InStock",
      url: vehicle.url,
    },
  };
};

export const generateAggregateRatingSchema = (rating: {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: rating.ratingValue,
    reviewCount: rating.reviewCount,
    bestRating: rating.bestRating || 5,
    worstRating: rating.worstRating || 1,
  };
};

export const generateItemListSchema = (items: Array<{ name: string; url: string; position: number }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
};

export const generateArticleSchema = (article: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
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
    url: article.url,
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CompareAuto.in",
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
    description: "India's comprehensive car comparison platform with variant-wise details and pricing",
    sameAs: [
      "https://twitter.com/compareauto",
      "https://facebook.com/compareauto",
      "https://instagram.com/compareauto",
    ],
  };
};

export const injectStructuredData = (data: object, id = "structured-data") => {
  let script = document.getElementById(id) as HTMLScriptElement | null;

  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
};

// Default OG image URL
export const DEFAULT_OG_IMAGE = `${window.location.origin}/og-default.png`;
