import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowDown, ArrowUp } from "lucide-react";

interface ScrollToTopProps {
  smooth?: boolean;
}

const ScrollToTop = ({ smooth = true }: ScrollToTopProps) => {
  const { pathname } = useLocation();
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const animationFrameRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateScrollState = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      const currentScroll = window.scrollY || doc.scrollTop || 0;

      setHasScrollableContent(maxScroll > 180);
      setIsAtTop(currentScroll <= 80);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [pathname]);

  const handleScrollToggle = () => {
    if (typeof window === "undefined") return;

    const doc = document.documentElement;
    const targetTop = isAtTop ? Math.max(0, doc.scrollHeight - window.innerHeight) : 0;

    const animateScrollTo = (destinationTop: number) => {
      const startTop = window.scrollY || document.documentElement.scrollTop || 0;
      const distance = destinationTop - startTop;
      if (Math.abs(distance) < 1) return;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const duration = Math.min(2400, Math.max(1200, Math.abs(distance) * 0.9));
      const startTime = performance.now();

      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);
        const nextTop = startTop + distance * easedProgress;

        window.scrollTo(0, nextTop);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    };

    if (smooth) {
      animateScrollTo(targetTop);
    } else {
      window.scrollTo(0, targetTop);
    }
  };

  if (!hasScrollableContent) return null;

  return (
    <button
      type="button"
      onClick={handleScrollToggle}
      aria-label={isAtTop ? "Scroll to bottom" : "Scroll to top"}
      title={isAtTop ? "Go to bottom" : "Go to top"}
      className="fixed bottom-6 right-4 z-40 h-11 w-11 rounded-full border border-teal-300/70 bg-white/95 text-teal-700 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-100/70 to-transparent opacity-80" aria-hidden="true" />
      <span className="relative flex items-center justify-center">
        {isAtTop ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
      </span>
    </button>
  );
};

export default ScrollToTop;
