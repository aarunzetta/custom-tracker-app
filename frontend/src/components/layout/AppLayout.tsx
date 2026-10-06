import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content area */}
      <main
        className={`
          flex-1 flex flex-col min-w-0 overflow-hidden
          transition-all duration-200
        `}
      >
        {/* Page content renders here via React Router */}
        <Outlet />
      </main>
    </div>
  );
}
