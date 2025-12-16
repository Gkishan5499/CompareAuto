import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { searchApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export const SearchAutocomplete = ({ className = "" }: { className?: string }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          const results = await searchApi.getSuggestions(query);
          setSuggestions(results);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
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
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === "brand") {
      navigate(`/brands/${suggestion.brandSlug}`);
    } else if (suggestion.type === "model") {
      navigate(`/${suggestion.brandSlug}/${suggestion.slug}`);
    } else if (suggestion.type === "variant") {
      navigate(`/${suggestion.brandSlug}/${suggestion.modelSlug}/${suggestion.slug}`);
    }
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
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
          onFocus={() => query.trim().length > 1 && setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-autocomplete="list"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <Card
          ref={dropdownRef}
          id="search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50"
        >
          {suggestions.map((suggestion, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={index}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 ${
                  isSelected ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-base">
                    {suggestion.name}
                  </div>
                  {suggestion.type === "brand" && (
                    <div className="text-xs text-gray-500 mt-0.5">View all models</div>
                  )}
                  {suggestion.type === "model" && suggestion.bodyType && (
                    <div className="text-xs text-gray-500 mt-0.5">{suggestion.bodyType}</div>
                  )}
                </div>
                {suggestion.type && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {suggestion.type}
                  </Badge>
                )}
              </button>
            );
          })}
        </Card>
      )}

      {isOpen && query.trim().length > 1 && suggestions.length === 0 && !isLoading && (
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
