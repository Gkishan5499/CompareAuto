import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Home, GitCompare, ArrowRight } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would search and redirect to results
      // For now, redirect to brands page
      navigate(`/brands?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickLinks = [
    {
      title: "Browse All Brands",
      description: "Explore cars from 50+ manufacturers",
      icon: Home,
      link: "/brands",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Compare Cars",
      description: "Side-by-side comparison of models",
      icon: GitCompare,
      link: "/compare",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Car Tools",
      description: "EMI calculator and price estimator",
      icon: Search,
      link: "/tools",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Illustration */}
          <div className="mb-8">
            <svg
              className="w-48 h-48 mx-auto text-muted-foreground/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">We Couldn't Find That Car</h2>
            <p className="text-lg text-muted-foreground">
              The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>
          </div>

          {/* Search Box */}
          <Card className="p-6 mb-12">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search for a car, brand, or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="lg">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Try searching for "Swift", "Creta", or any car you're interested in
              </p>
            </form>
          </Card>

          {/* Quick Links */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold mb-6">Or explore these popular sections:</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {quickLinks.map((item, index) => (
                <Link key={index} to={item.link}>
                  <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                    <div className={`${item.bgColor} ${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Home Button */}
          <Link to="/">
            <Button size="lg" variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
