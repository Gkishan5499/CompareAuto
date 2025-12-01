import { useNavigate } from "react-router-dom";
import { useApiList, useApiDelete } from "../../hooks/useapi";
import { Button } from "../../components/ui/button";
import { Pencil, Trash2, Plus, Upload } from "lucide-react"; // Assuming you use lucide-react

// 1. Define the data shape
interface Brand {
  id: string;
  name: string;
  country: string;
  logo: string | null;
}

export default function BrandList() {
  const navigate = useNavigate();
  
  // 2. Add Type to the hook for autocomplete support
  const { data: brands = [], isLoading } = useApiList<Brand[]>(["brands"], "/api/brands");
  const deleteBrand = useApiDelete(["brands"], "/api/brands");

  // 3. Safety Check for Deletion
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this brand? This cannot be undone.")) {
      deleteBrand.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading brands data...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Brands</h2>
          <p className="text-sm text-slate-500">Manage your brand catalog and assets.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/brands/import")}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button size="sm" onClick={() => navigate("/brands/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Brand
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
              <tr>
                <th className="p-4 w-[100px]">Logo</th>
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Country</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No brands found. Click "New Brand" to create one.
                  </td>
                </tr>
              ) : (
                brands.map((b: Brand) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      {b.logo ? (
                        <img 
                          src={b.logo} 
                          alt={b.name} 
                          className="h-10 w-10 object-contain rounded border bg-white" 
                        />
                      ) : (
                        <div className="h-10 w-10 bg-slate-100 rounded border flex items-center justify-center text-xs text-slate-400">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-500">{b.id}</td>
                    <td className="p-4 font-medium text-slate-900">{b.name}</td>
                    <td className="p-4 text-slate-600">{b.country}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => navigate(`/brands/${b.id}/edit`)}
                          title="Edit Brand"
                        >
                          <Pencil className="w-4 h-4 text-slate-600 hover:text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(b.id)}
                          title="Delete Brand"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}