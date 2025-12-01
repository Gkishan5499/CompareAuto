import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useApiList, useApiDelete } from "../../hooks/useapi";

export default function DealerList() {
  const { data: dealers = [], isLoading } = useApiList(["dealers"], "/api/dealers");
  const deleteDealer = useApiDelete(["dealers"], "/api/dealers");
  const navigate = useNavigate();

  if (isLoading) return "Loading...";

  return (
    <div className="p-6">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl font-semibold">Dealers</h1>
        <Button onClick={() => navigate('/dealers/new')}>Add Dealer</Button>
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
          {dealers.map((d: any) => (
            <tr key={d.id} className="border">
              <td className="p-2">{d.name}</td>
              <td className="p-2">{d.address?.line1 || "-"}</td>
              <td className="p-2">{d.phones?.[0] || "-"}</td>
              <td className="p-2 flex gap-4">
                <button className="text-blue-600" onClick={() => navigate(`/dealers/${d.id}/edit`)}>Edit</button>
                <button className="text-red-600" onClick={() => deleteDealer.mutate(d.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
