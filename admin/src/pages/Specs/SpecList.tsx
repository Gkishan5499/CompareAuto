import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useApiList, useApiDelete } from "../../hooks/useapi";

export default function SpecList() {
  const { data: specs = [], isLoading } = useApiList(["specs"], "/api/specs");
  const deleteSpec = useApiDelete(["specs"], "/api/specs");
  const navigate = useNavigate();

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

      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Variant ID</th>
            <th className="p-2">Summary</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {specs.items?.length ? specs.items.map((s: any) => (
            <tr key={s.variantId} className="border">
              <td className="p-2">{s.variantId}</td>
              <td className="p-2">{s.overview?.summary || '-'}</td>
              <td className="p-2 flex gap-4">
                <button className="text-blue-600" onClick={() => navigate(`/specs/${s.variantId}/edit`)}>Edit</button>
                <button className="text-red-600" onClick={() => deleteSpec.mutate(s.variantId)}>Delete</button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={3} className="p-8 text-center">No specifications found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
