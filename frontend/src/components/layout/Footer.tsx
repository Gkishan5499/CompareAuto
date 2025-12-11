import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Car } from "lucide-react";
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
    <footer className="bg-slate-950 text-slate-300 font-sans relative overflow-hidden border-t border-slate-900">
      
      {/* 1. BRAND GRADIENT LINE */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600" />

      {/* 2. MOBILE AD SLOT */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 py-4">
         <div className="container mx-auto px-4 flex justify-center">
            <AdSlot id="footer_mobile_leaderboard" />
         </div>
      </div>

      {/* 3. KPI STRIP */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-4 py-10 md:py-12">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800/50">
              {kpis.map((kpi, idx) => (
                 <div key={idx} className="space-y-1">
                    <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">{kpi.value}</div>
                    <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">{kpi.label}</div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* 4. MAIN LINKS CONTENT */}
      <div className="container mx-auto px-4 py-16">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* BRAND COLUMN (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
               <Link to="/" className="inline-flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform">
                     <Car className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-bold text-white tracking-tight">CompareAuto<span className="text-slate-500">.in</span></span>
               </Link>
               <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
                  India's most trusted car comparison platform. We help you make the right choice by providing detailed specs, variant comparisons, and unbiased reviews.
               </p>
               
               <div className="flex gap-3 pt-2">
                  {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                     <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all duration-300">
                        <Icon className="w-4 h-4" />
                     </a>
                  ))}
               </div>
            </div>

            {/* LINKS COLUMNS (8 Cols / 4 sections) */}
            <div className="lg:col-span-2 space-y-6">
               <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Company</h4>
               <ul className="space-y-3 text-sm">
                  {aboutLinks.map(link => (
                     <li key={link.to}>
                        <Link to={link.to} className="text-slate-400 hover:text-orange-400 transition-colors">{link.label}</Link>
                     </li>
                  ))}
               </ul>
            </div>

            <div className="lg:col-span-2 space-y-6">
               <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Quick Links</h4>
               <ul className="space-y-3 text-sm">
                  {quickLinks.map(link => (
                     <li key={link.to}>
                        <Link to={link.to} className="text-slate-400 hover:text-orange-400 transition-colors">{link.label}</Link>
                     </li>
                  ))}
               </ul>
            </div>

            <div className="lg:col-span-2 space-y-6">
               <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Explore</h4>
               <ul className="space-y-3 text-sm">
                  {exploreLinks.map(link => (
                     <li key={link.to}>
                        <Link to={link.to} className="text-slate-400 hover:text-orange-400 transition-colors">{link.label}</Link>
                     </li>
                  ))}
               </ul>
            </div>

            <div className="lg:col-span-2 space-y-6">
               <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Tools</h4>
               <ul className="space-y-3 text-sm">
                  {tools.map(link => (
                     <li key={link.to}>
                        <Link to={link.to} className="text-slate-400 hover:text-orange-400 transition-colors">{link.label}</Link>
                     </li>
                  ))}
               </ul>
            </div>

         </div>
      </div>

      {/* 5. COPYRIGHT BAR */}
      <div className="border-t border-slate-900 bg-slate-950 py-8">
         <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} CompareAuto.in. All rights reserved.</p>
            <div className="flex gap-6">
               <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
               <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
               <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
         </div>
      </div>
    </footer>
  );
};

export default Footer;