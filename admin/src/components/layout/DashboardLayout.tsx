import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

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
