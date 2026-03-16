import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useApiList, useApiDelete } from "../../hooks/useapi";
import { Search } from "lucide-react";

export default function UserList() {
  const { data, isLoading } = useApiList<any[]>(["admin-users"], "/api/admin-users");
  const deleteUser = useApiDelete(["admin-users"], "/api/admin-users");
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const users = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).items)) return (data as any).items;
    return [];
  }, [data]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((u: any) =>
      u.username?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  if (isLoading) return "Loading...";

  return (
    <div className="p-6">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button onClick={() => navigate("/users/new")}>New User</Button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by username, email or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Username</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            filteredUsers.map((u: any) => (
              <tr key={u._id || u.id || u.username} className="border">
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.email || "-"}</td>
                <td className="p-2">{u.role || "editor"}</td>
                <td className="p-2 flex gap-4 justify-center">
                  <button
                    className="text-blue-600"
                    onClick={() => navigate(`/users/${u._id || u.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => deleteUser.mutate(u._id || u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
