import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CommentList() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("pending");
  const [loading, setLoading] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const url = `/api/comments?status=${encodeURIComponent(status)}`;
      const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/comments/${id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    await load();
  };
  const remove = async (id: string) => {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Comments</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">Filter:</span>
          <select className="h-9 border rounded px-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Article</th>
              <th className="text-left px-3 py-2">Content</th>
              <th className="text-left px-3 py-2">Date</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2">
                  {c.article?.title ? (
                    <Link to={`/articles/${c.article._id}/edit`} className="text-blue-600 hover:underline">{c.article.title}</Link>
                  ) : c.articleId}
                </td>
                <td className="px-3 py-2 max-w-[400px] truncate">{c.content}</td>
                <td className="px-3 py-2">{new Date(c.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2 flex gap-2">
                  <Button size="sm" onClick={() => updateStatus(c._id, "approved")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(c._id, "rejected")}>Reject</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(c._id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>No comments</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}