import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePagesStore } from "@/stores/pagesStore";

type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pages, isLoading, createPage } = usePagesStore();
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreatePage() {
    setIsCreating(true);
    try {
      const newPage = await createPage("Untitled");
      navigate(`/pages/${newPage.id}`);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-white border-r border-gray-200",
        "transition-all duration-200 ease-in-out",
        isOpen ? "w-60" : "w-14",
      )}
    >
      {/* Logo / App name */}
      <div className="flex items-center h-14 px-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded-md bg-gray-900 shrink-0" />
          {isOpen && (
            <span className="font-semibold text-gray-900 truncate">
              Tracker
            </span>
          )}
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-3 top-13 z-10",
          "w-6 h-6 rounded-full bg-white border border-gray-200",
          "flex items-center justify-center",
          "text-gray-400 hover:text-gray-700",
          "transition-colors shadow-sm",
        )}
      >
        {isOpen ? (
          <ChevronLeft className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {/* Home link */}
        <SidebarItem
          icon={<LayoutDashboard className="w-4 h-4 shrink-0" />}
          label="Home"
          isOpen={isOpen}
          isActive={location.pathname === "/"}
          onClick={() => navigate("/")}
        />

        {/* Divider */}
        <div className="pt-3 pb-1">
          {isOpen && (
            <p className="px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Pages
            </p>
          )}
        </div>

        {/* Pages list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        ) : (
          pages.map((page) => (
            <SidebarItem
              key={page.id}
              icon={
                <span className="text-sm shrink-0">{page.icon ?? "📄"}</span>
              }
              label={page.name}
              isOpen={isOpen}
              isActive={location.pathname === `/pages/${page.id}`}
              onClick={() => navigate(`/pages/${page.id}`)}
            />
          ))
        )}

        {/* New page button */}
        <button
          onClick={handleCreatePage}
          disabled={isCreating}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
            "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
            "transition-colors text-sm",
            !isOpen && "justify-center",
          )}
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          ) : (
            <Plus className="w-4 h-4 shrink-0" />
          )}
          {isOpen && <span>New page</span>}
        </button>
      </nav>

      {/* Bottom — user avatar */}
      <div
        className={cn(
          "shrink-0 border-t border-gray-200 p-3",
          "flex items-center",
          isOpen ? "gap-3" : "justify-center",
        )}
      >
        <UserButton afterSignOutUrl="/sign-in" />
        {isOpen && (
          <span className="text-sm text-gray-600 truncate">My Account</span>
        )}
      </div>
    </aside>
  );
}

// Reusable sidebar item component
type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
};

function SidebarItem({
  icon,
  label,
  isOpen,
  isActive,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
        "transition-colors text-sm text-left",
        isActive
          ? "bg-gray-100 text-gray-900 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        !isOpen && "justify-center",
      )}
      title={!isOpen ? label : undefined}
    >
      {icon}
      {isOpen && <span className="truncate">{label}</span>}
    </button>
  );
}
