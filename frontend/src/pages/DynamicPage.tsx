import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { updateMetaTags } from "@/lib/seo";
import PageRenderer from "@/components/builder/PageRenderer";
import pagesData from "@/data/pages.json";
import NotFound from "./NotFound";

/**
 * DynamicPage - Renders pages defined in pages.json
 */
const DynamicPage = () => {
  const location = useLocation();
  const path = location.pathname;

  // Find matching route in pages.json
  const routeConfig = pagesData.routes.find((route) => route.path === path);

  useEffect(() => {
    if (routeConfig?.seo) {
      updateMetaTags({
        title: routeConfig.seo.title,
        description: routeConfig.seo.description,
        keywords: routeConfig.seo.keywords || [],
        canonical: `https://compareauto.in${path}`,
      });
    }
  }, [routeConfig, path]);

  if (!routeConfig) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen">
      <PageRenderer sections={routeConfig.sections} />
    </div>
  );
};

export default DynamicPage;
