import { NavLink } from "react-router-dom";
import { LayoutDashboard, CarFront, Layers, Settings, FileSpreadsheet, MapPin, Users, Database, DollarSign, Image } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/brands", label: "Brands", icon: CarFront },
  { to: "/models", label: "Models", icon: Layers },
  { to: "/variants", label: "Variants", icon: Layers },
  { to: "/specs", label: "Specs", icon: Database },
  { to: "/pricing", label: "Pricing & Taxes", icon: DollarSign },
  { to: "/hero-carousel", label: "Hero Carousel", icon: Image },
  { to: "/dealers", label: "Dealers", icon: MapPin },
  { to: "/users", label: "Users", icon: Users },
  { to: "/import", label: "Import CSV", icon: FileSpreadsheet },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} fixed h-screen bg-white shadow-lg border-r z-50 flex flex-col transition-all`}> 
      <div className={`p-4 font-bold text-lg border-b flex items-center gap-3 ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-2">
          <div className="rounded-full w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">A</div>
          {!collapsed && <div className="text-lg font-semibold">CampareCar Admin</div>}
        </div>
        {!collapsed && <div className="text-xs text-muted-foreground">v1.0</div>}
      </div>

      <nav className="flex-1 p-2 space-y-1 mt-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Icon size={20} />
            <span className={`${collapsed ? "hidden" : "inline"}`}>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t text-sm text-muted-foreground">
        {!collapsed && <div>Quick actions</div>}
        <div className="mt-2 flex gap-2">
          <NavLink to="/brands" className="text-sm text-blue-600 hover:underline">Add brand</NavLink>
          {!collapsed && <span>|</span>}
          <NavLink to="/import" className="text-sm text-green-600 hover:underline">Import CSV</NavLink>
        </div>
      </div>
    </aside>
  );
}
