import { NavLink } from "react-router-dom";
import { LayoutDashboard, CarFront, Layers, Settings, FileSpreadsheet, MapPin, Database, Image, Mail, FileText, MessageSquare, Palette, TextAlignEnd, CalendarClock, Users } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { hasPermission, type PermissionKey } from "../../lib/permissions";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" as PermissionKey },
  { to: "/brands", label: "Brands", icon: CarFront, permission: "brands" as PermissionKey },
  { to: "/models", label: "Models", icon: Layers, permission: "models" as PermissionKey },
  { to: "/variants", label: "Variants", icon: Layers, permission: "variants" as PermissionKey },
  { to: "/specs", label: "Car Specs", icon: Database, permission: "specs" as PermissionKey },
  { to: "/pricing", label: "Pricing & Taxes", icon: TextAlignEnd, permission: "pricing" as PermissionKey },
  { to: "/hero-carousel", label: "Hero Carousel", icon: Image, permission: "heroCarousel" as PermissionKey },
  { to: "/enquiries", label: "Enquiries", icon: Mail, permission: "enquiries" as PermissionKey },
  { to: "/articles", label: "Articles", icon: FileText, permission: "articles" as PermissionKey },
  { to: "/comments", label: "Comments", icon: MessageSquare, permission: "comments" as PermissionKey },
  { to: "/used-cars", label: "Used Cars", icon: CarFront, permission: "usedCars" as PermissionKey },
  { to: "/upcoming", label: "Upcoming Cars", icon: CalendarClock, permission: "upcomingCars" as PermissionKey },
  { to: "/dealers", label: "Dealers", icon: MapPin, permission: "dealers" as PermissionKey },
  { to: "/branding", label: "Branding", icon: Palette, permission: "branding" as PermissionKey },
  { to: "/import", label: "Import CSV", icon: FileSpreadsheet, permission: "importCsv" as PermissionKey },
  { to: "/users", label: "Users", icon: Users, permission: "users" as PermissionKey },
  { to: "/settings", label: "Settings", icon: Settings, permission: "settings" as PermissionKey },
];

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { user } = useAuth();
  const filteredNav = nav.filter((item) => hasPermission(user, item.permission));
  const canImport = hasPermission(user, "importCsv");
  const canBrands = hasPermission(user, "brands");

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} fixed h-screen bg-white shadow-lg border-r z-50 flex flex-col transition-all`}> 
      <div className={`p-4 font-bold text-lg border-b flex items-center gap-3 ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-2">
          <div className="rounded-full w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">A</div>
          {!collapsed && <div className="text-lg font-semibold">CampareCar Admin</div>}
        </div>
        {!collapsed && <div className="text-xs text-muted-foreground">v1.0</div>}
      </div>

      <nav className="flex-1 p-2 space-y-1 mt-3 overflow-y-auto min-h-0">
        {filteredNav.map(({ to, label, icon: Icon }) => (
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
          {canBrands && (
            <NavLink to="/brands" className="text-sm text-blue-600 hover:underline">Add brand</NavLink>
          )}
          {!collapsed && canBrands && canImport && <span>|</span>}
          {canImport && (
            <NavLink to="/import" className="text-sm text-green-600 hover:underline">Import CSV</NavLink>
          )}
        </div>
      </div>
    </aside>
  );
}
