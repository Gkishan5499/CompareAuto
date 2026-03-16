import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { getFirstAllowedPath, getPermissionForPath, hasPermission } from "../../lib/permissions";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const requiredPermission = getPermissionForPath(location.pathname);
  const fallbackPath = getFirstAllowedPath(user);
  const allowed = !requiredPermission || hasPermission(user, requiredPermission);

  if (!allowed && fallbackPath !== location.pathname) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (!allowed) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
        <div className="max-w-md text-center bg-white border rounded-lg p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Access denied</h2>
          <p className="text-gray-600 mt-2">Your account does not have permission for this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} />
      <div className={`${collapsed ? "ml-20" : "ml-64"} w-full transition-all bg-gray-50 min-h-screen`}> 
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="pt-20 px-6 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              {/* You can add breadcrumbs or small page title here */}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
