import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface ScrollToTopProps {
  smooth?: boolean;
}

const ScrollToTop = ({ smooth = true }: ScrollToTopProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (smooth) {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      } else {
        window.scrollTo(0, 0);
      }
    } catch (err) {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  }, [pathname, smooth]);

  return null;
};

export default ScrollToTop;
