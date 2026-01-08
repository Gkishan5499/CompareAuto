import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { CityPicker } from "@/components/layout/CityPicker";
import { useState, useEffect } from "react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logo, setLogo] = useState("");
  const location = useLocation();

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_BASE}/site-settings/logo`);
        if (res.ok) {
          const data = await res.json();
          setLogo(data.value);
        }
      } catch (err) {
        console.error("Failed to load logo", err);
      }
    };
    loadLogo();
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/brands", label: "Brands" },
    { to: "/compare", label: "Compare" },
    // { to: "/used-cars", label: "Used Cars" },
    { to: "/news", label: "News" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-white/95 backdrop-blur-md">
      <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center">
            {logo ? (
              <img
                src={logo}
                alt="CompareAuto Logo"
                className="h-12 w-auto md:h-14 object-contain"
              />
            ) : (
              <img
                src="/logo.png"
                alt="CompareAuto Logo"
                className="h-12 w-auto md:h-14 object-contain"
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-muted/30 rounded-full p-2 backdrop-blur-sm border border-border/50">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive(link.to)
                    ? "text-primary bg-primary/10 shadow-md scale-105"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/5 hover:scale-105"
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-lg">
            <div className="w-full relative">
              <div className="absolute inset-0 bg-primary/5 rounded-xl blur-sm"></div>
              <div className="relative">
                <SearchAutocomplete className="w-full" />
              </div>
            </div>
          </div>

          {/* City Picker + Mobile Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <CityPicker />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-lg hover:bg-primary/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-gradient-to-b from-background to-muted/30 backdrop-blur-xl py-6 animate-in slide-in-from-top shadow-inner">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-base font-semibold px-6 py-4 rounded-xl transition-all ${
                    isActive(link.to)
                      ? "text-primary bg-primary/10 border-l-4 border-primary shadow-sm"
                      : "text-foreground/80 hover:text-primary hover:bg-primary/5 hover:translate-x-2"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6 px-4">
              <div className="bg-muted/50 rounded-xl p-2">
                <CityPicker />
              </div>
            </div>

            <div className="mt-4 px-4">
              <SearchAutocomplete />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
