import { Link } from "react-router-dom";
import { useApiDelete, useApiList } from "../../hooks/useapi";


export default function ModelList() {
  const { data: models = [], isLoading } = useApiList(["models"], "/api/models");
  const deleteModel = useApiDelete(["models"], "/api/models");

  if (isLoading) return "Loading...";

  return (
    <div className="p-6">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl font-semibold">Car Models</h1>
        <Link to="/models/new" className="bg-green-600 text-white px-3 py-1 rounded">Add Model</Link>
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
          {models.map((m: any) => (
            <tr key={m.id} className="border">
              <td className="p-2"><img src={m.image} className="h-14 rounded" /></td>
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
          ))}
        </tbody>

      </table>
    </div>
  );
}
