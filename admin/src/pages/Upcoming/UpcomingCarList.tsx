import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import client from "../../api/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Calendar } from "lucide-react";

export default function UpcomingCarList() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["upcoming-cars"],
    queryFn: async () => {
      const res = await client.get("/api/upcoming-cars");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/api/upcoming-cars/${id}`);
    },
    onSuccess: () => {
      toast.success("Upcoming car deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["upcoming-cars"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete upcoming car");
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this upcoming car?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return "TBA";
    if (min && max && min !== max) {
      return `₹${(min / 100000).toFixed(2)}L - ₹${(max / 100000).toFixed(2)}L`;
    }
    const price = min || max;
    return `₹${(price! / 100000).toFixed(2)}L`;
  };

  const formatLaunch = (launch?: string, window?: string) => {
    if (window) return window;
    if (launch) {
      const date = new Date(launch);
      return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    }
    return "TBA";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Upcoming Cars</h1>
          <p className="text-muted-foreground">Manage upcoming car launches</p>
        </div>
        <div className="flex gap-2">
          <Link to="/upcoming/import">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Import CSV
            </Button>
          </Link>
          <Link to="/upcoming/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Car
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="text-left p-4 font-semibold">Image</th>
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Brand</th>
                <th className="text-left p-4 font-semibold">Body Type</th>
                <th className="text-left p-4 font-semibold">Fuel Type</th>
                <th className="text-left p-4 font-semibold">Expected Price</th>
                <th className="text-left p-4 font-semibold">Launch Window</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Calendar className="h-12 w-12 opacity-20" />
                      <div>No upcoming cars found</div>
                      <Link to="/upcoming/import">
                        <Button variant="outline" size="sm">Import CSV</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                cars.map((car: any) => (
                  <tr key={car.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      {car.image ? (
                        <img
                          src={car.image}
                          alt={car.name}
                          className="h-12 w-16 object-cover rounded border"
                        />
                      ) : (
                        <div className="h-12 w-16 bg-slate-200 rounded border flex items-center justify-center text-xs text-slate-500">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-medium">{car.name}</td>
                    <td className="p-4">{car.brandName}</td>
                    <td className="p-4">{car.bodyType || "—"}</td>
                    <td className="p-4">
                      {car.fuelTypes?.length > 0 ? car.fuelTypes.join(", ") : "—"}
                    </td>
                    <td className="p-4">{formatPrice(car.expectedPriceMin, car.expectedPriceMax)}</td>
                    <td className="p-4">{formatLaunch(car.expectedLaunch, car.launchWindow)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Link to={`/upcoming/${car.id}/edit`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(car.id)}
                          disabled={deleteMutation.isPending && deleteId === car.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {cars.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {cars.length} upcoming car{cars.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
