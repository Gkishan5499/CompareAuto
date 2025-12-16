import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useApiList, useApiDelete } from "../../hooks/useapi";
import { Search } from "lucide-react";

export default function DealerList() {
  const { data: dealers = [], isLoading } = useApiList(["dealers"], "/api/dealers");
  const deleteDealer = useApiDelete(["dealers"], "/api/dealers");
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(20);
  
  const filteredDealers = useMemo(() => {
    if (!searchQuery) return dealers;
    const query = searchQuery.toLowerCase();
    return dealers.filter((d: any) => 
      d.name?.toLowerCase().includes(query) ||
      d.address?.line1?.toLowerCase().includes(query) ||
      d.address?.city?.toLowerCase().includes(query) ||
      d.address?.state?.toLowerCase().includes(query) ||
      d.phones?.some((p: string) => p.includes(searchQuery))
    );
  }, [dealers, searchQuery]);
  
  const displayedDealers = filteredDealers.slice(0, displayCount);

  if (isLoading) return "Loading...";

  return (
    <div className="p-6">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl font-semibold">Dealers</h1>
        <Button onClick={() => navigate('/dealers/new')}>Add Dealer</Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by dealer name, address, city, state, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="mb-2 text-sm text-gray-600">
        Showing {displayedDealers.length} of {filteredDealers.length} dealers
      </div>

      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Address</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedDealers.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-gray-500">
                {searchQuery ? "No dealers found matching your search." : "No dealers found"}
              </td>
            </tr>
          ) : (
            displayedDealers.map((d: any) => (
              <tr key={d.id} className="border">
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.address?.line1 || "-"}</td>
                <td className="p-2">{d.phones?.[0] || "-"}</td>
                <td className="p-2 flex gap-4">
                  <button className="text-blue-600" onClick={() => navigate(`/dealers/${d.id}/edit`)}>Edit</button>
                  <button className="text-red-600" onClick={() => deleteDealer.mutate(d.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Load More Button */}
      {displayCount < filteredDealers.length && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => setDisplayCount(prev => prev + 20)}
          >
            Load More ({filteredDealers.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
