import { useAuth } from "../../auth/AuthProvider";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { LogOut, Menu, Search, Bell, Plus } from "lucide-react";
import { useState } from "react";

export default function Header({ collapsed, setCollapsed }: { collapsed?: boolean; setCollapsed?: (v: boolean) => void; }) {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className={`h-16 shadow bg-white fixed right-0 ${collapsed ? "left-20" : "left-64"} z-40 flex items-center justify-between px-4 md:px-6`}>
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => setCollapsed?.(!collapsed)}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded p-1 px-2">
          <Search size={16} />
          <input placeholder="Search..." className="bg-transparent outline-none text-sm" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm text-gray-700">{user?.username}</span>
          <button className="p-2 hover:bg-gray-100 rounded" title="Notifications">
            <Bell size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded flex items-center gap-2" onClick={() => { /* open quick add modal */ }} title="Quick add">
            <Plus size={16} /> Add
          </button>
          <button className="flex items-center gap-2 text-red-500 hover:text-red-700" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
