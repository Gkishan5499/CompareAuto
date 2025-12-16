import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useApiList, useApiDelete } from "../../hooks/useapi";
import { Search } from "lucide-react";

export default function VariantList() {
  const { data: variants = [] } = useApiList<any[]>(["variants"], "/api/variants");
  const { isLoading } = useApiList(["variants"], "/api/variants");
  const deleteVariant = useApiDelete(["variants"], "/api/variants");
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(20);
  
  const filteredVariants = useMemo(() => {
    if (!searchQuery) return variants;
    const query = searchQuery.toLowerCase();
    return variants.filter((v: any) => 
      v.name?.toLowerCase().includes(query) ||
      v.id?.toLowerCase().includes(query) ||
      v.modelId?.toLowerCase().includes(query) ||
      v.fuelType?.toLowerCase().includes(query)
    );
  }, [variants, searchQuery]);
  
  const displayedVariants = filteredVariants.slice(0, displayCount);

  if (isLoading) return "Loading...";

  return (
    <div className="p-6">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl font-semibold">Variants</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/variants/import")}>Import CSV</Button>
          <Button onClick={() => navigate("/variants/new")}>New Variant</Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by variant name, ID, model ID, or fuel type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="mb-2 text-sm text-gray-600">
        Showing {displayedVariants.length} of {filteredVariants.length} variants
      </div>

      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
              <th className="p-2">Variant ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Model ID</th>
              <th className="p-2">Price</th>
              <th className="p-2">Fuel</th>
              <th className="p-2">Actions</th>
            </tr>
        </thead>
        <tbody>
          {displayedVariants.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-gray-500">
                {searchQuery ? "No variants found matching your search." : "No variants found"}
              </td>
            </tr>
          ) : (
            displayedVariants.map((v: any) =>(
              <tr key={v.id} className="border">
                <td className="p-2 font-mono text-sm text-gray-700">{v.id}</td>
                <td className="p-2">{v.name}</td>
                <td className="p-2">{v.modelId}</td>
                <td className="p-2">{v.price}</td>
                <td className="p-2">{v.fuelType}</td>
                <td className="p-2 flex gap-4">
                  <button className="text-blue-600" onClick={() => navigate(`/variants/${v.id}/edit`)}>Edit</button>
                  <button className="text-red-600" onClick={() => deleteVariant.mutate(v.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Load More Button */}
      {displayCount < filteredVariants.length && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => setDisplayCount(prev => prev + 20)}
          >
            Load More ({filteredVariants.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
