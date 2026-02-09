import { useAuth } from "../../auth/AuthProvider";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { LogOut, Menu, Search, Bell, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";

export default function Header({ collapsed, setCollapsed }: { collapsed?: boolean; setCollapsed?: (v: boolean) => void; }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSearchOpen(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await client.get(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
        const items = Array.isArray(res.data) ? res.data : [];
        setSuggestions(items);
        setSearchOpen(true);
      } catch {
        setSuggestions([]);
        setSearchOpen(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: any) => {
    const id = item?.id || item?.slug;
    if (!id) return;

    if (item.type === "brand") navigate(`/brands/edit/${id}`);
    if (item.type === "model") navigate(`/models/${id}/edit`);
    if (item.type === "variant") navigate(`/variants/${id}/edit`);

    setSearchOpen(false);
    setQuery("");
  };

  return (
    <header className={`h-16 shadow bg-white fixed right-0 ${collapsed ? "left-20" : "left-64"} z-40 flex items-center justify-between px-4 md:px-6`}>
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => setCollapsed?.(!collapsed)}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="relative hidden md:flex items-center gap-2 bg-gray-100 rounded p-1 px-2">
          <Search size={16} />
          <input
            placeholder="Search brands, models, variants..."
            className="bg-transparent outline-none text-sm w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          />
          {searchOpen && (
            <div className="absolute top-10 left-0 right-0 bg-white border rounded shadow z-50">
              {isSearching && (
                <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
              )}
              {!isSearching && suggestions.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">No results</div>
              )}
              {!isSearching && suggestions.map((item, idx) => (
                <button
                  key={`${item.type}-${item.id || item.slug}-${idx}`}
                  type="button"
                  onMouseDown={() => handleSelect(item)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.category}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm text-gray-700">{user?.username}</span>
          <button className="p-2 hover:bg-gray-100 rounded" title="Notifications">
            <Bell size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded flex items-center gap-2" onClick={() => { /* open quick add modal */ }} title="Quick add">
            <Plus size={16} /> Add
          </button>
          <button className="flex items-center gap-2 text-red-500 hover:text-red-700" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
