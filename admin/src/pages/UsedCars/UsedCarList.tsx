import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useApiList, useApiDelete } from "../../hooks/useapi";
import { Search, Plus } from "lucide-react";

export default function UsedCarList() {
  const { data: cars = [], isLoading } = useApiList(["used-cars"], "/api/used-cars");
  const deleteCar = useApiDelete(["used-cars"], "/api/used-cars");
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(20);

  const filtered = useMemo(() => {
    if (!query) return cars;
    const q = query.toLowerCase();
    return cars.filter((c: any) => (
      c.title?.toLowerCase().includes(q) ||
      c.brand?.toLowerCase().includes(q) ||
      c.carmodel?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    ));
  }, [cars, query]);

  const displayed = filtered.slice(0, displayCount);

  if (isLoading) return "Loading...";

  return (
    <div className="p-6">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl font-semibold">Used Cars</h1>
        <Button onClick={() => navigate("/used-cars/new")}>
          <Plus className="w-4 h-4 mr-2" /> Add Used Car
        </Button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by title, brand, model, or city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Title</th>
            <th className="p-2">Brand</th>
            <th className="p-2">Model</th>
            <th className="p-2">City</th>
            <th className="p-2">Price</th>
            <th className="p-2">Year</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayed.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-500">
                {query ? "No used cars match your search." : "No used cars found."}
              </td>
            </tr>
          ) : (
            displayed.map((c: any) => (
              <tr key={c.id} className="border">
                <td className="p-2">{c.title}</td>
                <td className="p-2">{c.brand}</td>
                <td className="p-2">{c.carmodel}</td>
                <td className="p-2">{c.city}</td>
                <td className="p-2">₹{c.price?.toLocaleString()}</td>
                <td className="p-2">{c.year}</td>
                <td className="p-2 flex gap-4">
                  <button className="text-blue-600" onClick={() => navigate(`/used-cars/${c.id}/edit`)}>Edit</button>
                  <button className="text-red-600" onClick={() => deleteCar.mutate(c.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {displayCount < filtered.length && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setDisplayCount((p) => p + 20)}>
            Load More ({filtered.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
