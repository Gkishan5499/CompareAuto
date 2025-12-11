import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useApiList, useApiDelete } from "../../hooks/useapi";

export default function VariantList() {
  const { data: variants = [] } = useApiList<any[]>(["variants"], "/api/variants");
  const { isLoading } = useApiList(["variants"], "/api/variants");
  const deleteVariant = useApiDelete(["variants"], "/api/variants");
  const navigate = useNavigate();

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
          {variants.map((v: any) =>(
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
