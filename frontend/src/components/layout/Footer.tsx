import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Car, Mail, Phone, MapPin } from "lucide-react";
import AdSlot from "@/components/ads/AdSlot";

const Footer = () => {
  const aboutLinks = [
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
    { to: "/faq", label: "FAQ" },
    { to: "/terms", label: "Terms & Conditions" },
  ];

  const quickLinks = [
    { to: "/brands", label: "All Brands" },
    { to: "/body", label: "Body Types" },
    { to: "/fuel", label: "Fuel Types" },
    { to: "/new-cars", label: "New Cars" },
    { to: "/upcoming-cars", label: "Upcoming Cars" },
    { to: "/compare", label: "Compare Cars" },
    { to: "/news", label: "Auto News" },
    { to: "/tools", label: "Tools" },
  ];

  const exploreLinks = [
    { to: "/body/suv", label: "SUV Cars" },
    { to: "/body/sedan", label: "Sedan Cars" },
    { to: "/body/hatchback", label: "Hatchback Cars" },
    { to: "/fuel/ev", label: "Electric Cars" },
    { to: "/fuel/hybrid", label: "Hybrid Cars" },
    { to: "/used-cars", label: "Used Cars" },
  ];

  const tools = [
    { to: "/tools/emi-calculator", label: "EMI Calculator" },
    { to: "/tools/loan-calculator", label: "Loan Calculator" },
    { to: "/tools/insurance", label: "Car Insurance" },
    { to: "/tools/valuation", label: "Car Valuation" },
  ];

  const kpis = [
    { value: "500+", label: "Models" },
    { value: "50+", label: "Brands" },
    { value: "1M+", label: "Comparisons" },
    { value: "5K+", label: "Reviews" },
  ];

  return (
    <footer className="relative border-t bg-gradient-to-b from-background via-muted/20 to-muted/40 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Mobile Footer Ad - 320x100 */}
      <div className="md:hidden py-4 bg-white border-b relative z-10">
        <div className="container mx-auto px-4">
          <AdSlot id="footer_mobile_leaderboard" />
        </div>
      </div>

      {/* KPI Strip */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              Trusted by <span className="text-primary">Millions</span>
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Join thousands of car buyers making informed decisions
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {kpis.map((kpi, index) => (
              <div key={index} className="group text-center p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm border-2 border-border/50 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
                  {kpi.value}
                </div>
                <div className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </div>
                <div className="mt-2 h-1 w-12 bg-gradient-to-r from-primary to-primary/50 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {/* About Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg"></div>
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary/25 via-primary/15 to-primary/10 shadow-lg">
                  <Car className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl md:text-3xl font-extrabold text-primary">Compare</span>
                  <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Auto</span>
                  <span className="text-lg md:text-xl font-semibold text-muted-foreground">.in</span>
                </div>
                <span className="text-xs md:text-sm font-medium text-muted-foreground -mt-1">Your Car Comparison Expert</span>
              </div>
            </div>
            <p className="text-sm md:text-base text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Your trusted partner in finding the perfect car. Compare specs, prices, and reviews
              across all major brands in India. Make informed decisions with our comprehensive car comparison platform.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground mr-2">Follow Us:</span>
              <a href="#" className="group p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 text-blue-600 hover:text-blue-700 transition-all hover:scale-110 shadow-sm hover:shadow-md border border-blue-500/20">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="group p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-sky-500/5 hover:from-sky-500/20 hover:to-sky-500/10 text-sky-600 hover:text-sky-700 transition-all hover:scale-110 shadow-sm hover:shadow-md border border-sky-500/20">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="group p-3 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 hover:from-pink-500/20 hover:to-pink-500/10 text-pink-600 hover:text-pink-700 transition-all hover:scale-110 shadow-sm hover:shadow-md border border-pink-500/20">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="group p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 hover:from-red-500/20 hover:to-red-500/10 text-red-600 hover:text-red-700 transition-all hover:scale-110 shadow-sm hover:shadow-md border border-red-500/20">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* About Links */}
          <div>
            <h5 className="font-extrabold text-lg md:text-xl mb-6 md:mb-8 text-foreground relative pb-3 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-primary after:to-primary/50 after:rounded-full">
              About
            </h5>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all flex items-center gap-3 group hover:translate-x-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary group-hover:scale-125 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-extrabold text-lg md:text-xl mb-6 md:mb-8 text-foreground relative pb-3 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-primary after:to-primary/50 after:rounded-full">
              Quick Links
            </h5>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all flex items-center gap-3 group hover:translate-x-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary group-hover:scale-125 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h5 className="font-extrabold text-lg md:text-xl mb-6 md:mb-8 text-foreground relative pb-3 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-primary after:to-primary/50 after:rounded-full">
              Explore
            </h5>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all flex items-center gap-3 group hover:translate-x-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary group-hover:scale-125 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h5 className="font-extrabold text-lg md:text-xl mb-6 md:mb-8 text-foreground relative pb-3 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-primary after:to-primary/50 after:rounded-full">
              Tools
            </h5>
            <ul className="space-y-3">
              {tools.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all flex items-center gap-3 group hover:translate-x-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary group-hover:scale-125 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground mb-2">
                © 2025 <span className="font-bold text-foreground">CompareAuto.in</span>. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground/80">
                Made with ❤️ for car enthusiasts in India
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link to="/privacy" className="px-4 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all font-semibold text-muted-foreground hover:scale-105">
                Privacy Policy
              </Link>
              <Link to="/terms" className="px-4 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all font-semibold text-muted-foreground hover:scale-105">
                Terms of Service
              </Link>
              <Link to="/contact" className="px-4 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all font-semibold text-muted-foreground hover:scale-105">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
