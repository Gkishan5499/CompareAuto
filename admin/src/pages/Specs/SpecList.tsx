import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useApiList, useApiDelete } from "../../hooks/useapi";
import { Search } from "lucide-react";
import client from "../../api/client";

export default function SpecList() {
  const { data: specs = [], isLoading } = useApiList(["specs"], "/api/specs");
  const deleteSpec = useApiDelete(["specs"], "/api/specs");
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [displayCount, setDisplayCount] = useState(20);
  
  const specItems = (specs as any)?.items || [];
  
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const fetchSearch = async () => {
      try {
        const res = await client.get(`/api/specs?q=${encodeURIComponent(q)}&limit=50`);
        const items = res.data?.items || [];
        setSearchResults(items);
      } catch {
        setSearchResults([]);
      }
    };

    fetchSearch();
  }, [searchQuery]);

  const filteredSpecs = useMemo(() => {
    if (!searchQuery) return specItems;
    return searchResults;
  }, [specItems, searchQuery, searchResults]);
  
  const displayedSpecs = filteredSpecs.slice(0, displayCount);

  if (isLoading) return "Loading...";

  return (
    <div className="p-6">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl font-semibold">Specifications</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/specs/import')}>Import CSV</Button>
          <Button onClick={() => navigate('/specs/new')}>New Specs</Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by variant ID or summary..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="mb-2 text-sm text-gray-600">
        Showing {displayedSpecs.length} of {filteredSpecs.length} specifications
      </div>

      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Variant ID</th>
            <th className="p-2">Summary</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedSpecs.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-8 text-center text-gray-500">
                {searchQuery ? "No specifications found matching your search." : "No specifications found"}
              </td>
            </tr>
          ) : (
            displayedSpecs.map((s: any) => (
              <tr key={s.variantId} className="border">
                <td className="p-2">{s.variantId}</td>
                <td className="p-2">{s.overview?.summary || '-'}</td>
                <td className="p-2 flex gap-4">
                  <button className="text-blue-600" onClick={() => navigate(`/specs/${encodeURIComponent(s.variantId)}/edit`)}>Edit</button>
                  <button className="text-red-600" onClick={() => deleteSpec.mutate(encodeURIComponent(s.variantId))}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Load More Button */}
      {displayCount < filteredSpecs.length && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => setDisplayCount(prev => prev + 20)}
          >
            Load More ({filteredSpecs.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
