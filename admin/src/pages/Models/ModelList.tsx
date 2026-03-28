import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useApiDelete, useApiList } from "../../hooks/useapi";
import { Search } from "lucide-react";


interface Model {
  id: string;
  name: string;
  brandName: string;
  bodyType: string;
  image: string;
  vehicleCategory?: "car" | "bike";
}

export default function ModelList() {
  const [vehicleCategory, setVehicleCategory] = useState<"all" | "car" | "bike">("all");
  const modelsUrl = useMemo(
    () =>
      vehicleCategory === "all"
        ? "/api/models"
        : `/api/models?vehicleCategory=${vehicleCategory}`,
    [vehicleCategory]
  );

  const { data: models = [], isLoading } = useApiList<Model[]>(["models", vehicleCategory], modelsUrl);
  const deleteModel = useApiDelete(["models"], "/api/models");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(20);
  
  const filteredModels = useMemo(() => {
    if (!searchQuery) return models;
    const query = searchQuery.toLowerCase();
    return models.filter((m: any) => 
      m.name?.toLowerCase().includes(query) ||
      m.brandName?.toLowerCase().includes(query) ||
      m.bodyType?.toLowerCase().includes(query)
    );
  }, [models, searchQuery]);
  
  const displayedModels = filteredModels.slice(0, displayCount);

  if (isLoading) return "Loading...";

  return (
    <div className="p-6">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl font-semibold">Car Models</h1>
        <Link to="/models/new" className="bg-green-600 text-white px-3 py-1 rounded">Add Model</Link>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by model name, brand, or body type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={vehicleCategory}
          onChange={(e) => setVehicleCategory(e.target.value as "all" | "car" | "bike")}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
        </select>
      </div>

      <div className="mb-2 text-sm text-gray-600">
        Showing {displayedModels.length} of {filteredModels.length} models
      </div>

      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Image</th>
            <th className="p-2">Name</th>
            <th className="p-2">Brand</th>
            <th className="p-2">Body Type</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {displayedModels.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-gray-500">
                {searchQuery ? "No models found matching your search." : "No models found"}
              </td>
            </tr>
          ) : (
            displayedModels.map((m: any) => (
              <tr key={m.id} className="border">
                <td className="p-2"><img src={m.image} className="h-14 rounded" alt={m.name} /></td>
                <td className="p-2">{m.name}</td>
                <td className="p-2">{m.brandName}</td>
                <td className="p-2">{m.bodyType}</td>

                <td className="p-2 flex gap-4">
                  <Link to={`/models/${m.id}/edit`} className="text-blue-600">Edit</Link>

                  <button
                    className="text-red-600"
                    onClick={() => deleteModel.mutate(m.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>

      {/* Load More Button */}
      {displayCount < filteredModels.length && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => setDisplayCount(prev => prev + 20)}
          >
            Load More ({filteredModels.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
