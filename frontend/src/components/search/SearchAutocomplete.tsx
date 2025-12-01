import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Loader2, Building2, Car, Wrench, ShoppingCart } from "lucide-react";
import { performSearch, SearchResult } from "@/lib/api-search";
import { Separator } from "@/components/ui/separator";

export const SearchAutocomplete = ({ className = "" }: { className?: string }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    brands: SearchResult[];
    models: SearchResult[];
    variants: SearchResult[];
    usedCars: SearchResult[];
  }>({ brands: [], models: [], variants: [], usedCars: [] });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const allResults = [
    ...results.brands,
    ...results.models,
    ...results.variants,
    ...results.usedCars,
  ];

  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsLoading(true);
        try {
          const data = await performSearch(query);
          setResults(data.results);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults({ brands: [], models: [], variants: [], usedCars: [] });
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || allResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResults.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && allResults[selectedIndex]) {
          navigateToResult(allResults[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const navigateToResult = (result: SearchResult) => {
    navigate(result.url);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "brand":
        return Building2;
      case "model":
        return Car;
      case "variant":
        return Wrench;
      case "used-car":
        return ShoppingCart;
      default:
        return Search;
    }
  };

  const renderGroup = (title: string, items: SearchResult[]) => {
    if (items.length === 0) return null;

    return (
      <div className="py-2">
        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">{title}</div>
        {items.map((item, idx) => {
          const globalIndex = allResults.indexOf(item);
          const Icon = getIcon(item.type);
          const isSelected = globalIndex === selectedIndex;

          return (
            <button
              key={item.id}
              role="option"
              aria-selected={isSelected}
              className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors ${
                isSelected ? "bg-accent" : ""
              }`}
              onClick={() => navigateToResult(item)}
              onMouseEnter={() => setSelectedIndex(globalIndex)}
            >
              {item.image ? (
                <img src={item.image} alt="" className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search cars, brands, or models..."
          className="pl-9 pr-4"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length > 0 && setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-autocomplete="list"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && allResults.length > 0 && (
        <Card
          ref={dropdownRef}
          id="search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 max-h-[400px] overflow-y-auto z-50 shadow-lg"
        >
          {renderGroup("Brands", results.brands)}
          {results.brands.length > 0 && (results.models.length > 0 || results.variants.length > 0 || results.usedCars.length > 0) && <Separator />}
          {renderGroup("Models", results.models)}
          {results.models.length > 0 && (results.variants.length > 0 || results.usedCars.length > 0) && <Separator />}
          {renderGroup("Variants", results.variants)}
          {results.variants.length > 0 && results.usedCars.length > 0 && <Separator />}
          {renderGroup("Used Cars", results.usedCars)}
        </Card>
      )}

      {isOpen && query.trim().length > 0 && allResults.length === 0 && !isLoading && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 p-4 z-50 shadow-lg text-center text-sm text-muted-foreground"
        >
          No results found for "{query}"
        </Card>
      )}
    </div>
  );
};
