import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Trash2,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePagesStore, type Page } from "@/stores/pagesStore";

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
        "transition-all duration-200 ease-in-out shrink-0",
        isOpen ? "w-60" : "w-14",
      )}
    >
      {/* Logo */}
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
        {/* Home */}
        <SidebarItem
          icon={<LayoutDashboard className="w-4 h-4 shrink-0" />}
          label="Home"
          isOpen={isOpen}
          isActive={location.pathname === "/"}
          onClick={() => navigate("/")}
        />

        {/* Pages section */}
        <div className="pt-3 pb-1">
          {isOpen && (
            <p className="px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Pages
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        ) : (
          pages.map((page) => (
            <PageItem
              key={page.id}
              page={page}
              isOpen={isOpen}
              isActive={location.pathname === `/pages/${page.id}`}
              onClick={() => navigate(`/pages/${page.id}`)}
              onDeleted={() => {
                if (location.pathname === `/pages/${page.id}`) {
                  navigate("/");
                }
              }}
            />
          ))
        )}

        {/* New page */}
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

      {/* User */}
      <div
        className={cn(
          "shrink-0 border-t border-gray-200 p-3 flex items-center",
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

// ─── Static sidebar item (Home, etc.) ───────────────────────────────────────

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

// ─── Page item with rename + delete ─────────────────────────────────────────

type PageItemProps = {
  page: Page;
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
  onDeleted: () => void;
};

function PageItem({
  page,
  isOpen,
  isActive,
  onClick,
  onDeleted,
}: PageItemProps) {
  const { updatePage, deletePage } = usePagesStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(page.name);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus input when rename mode activates
  useEffect(() => {
    if (isRenaming) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isRenaming]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowDeleteConfirm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  async function handleRenameSubmit() {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === page.name) {
      setRenameValue(page.name);
      setIsRenaming(false);
      return;
    }
    await updatePage(page.id, { name: trimmed });
    setIsRenaming(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deletePage(page.id);
      onDeleted();
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  }

  // Collapsed sidebar — just show icon, no interactions
  if (!isOpen) {
    return (
      <button
        onClick={onClick}
        title={page.name}
        className={cn(
          "w-full flex items-center justify-center px-2 py-1.5 rounded-md",
          "transition-colors text-sm",
          isActive
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        )}
      >
        <span className="text-sm">{page.icon ?? "📄"}</span>
      </button>
    );
  }

  return (
    <div className="relative group">
      <div
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
          "transition-colors text-sm",
          isActive
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        )}
      >
        {/* Icon */}
        <span className="text-sm shrink-0">{page.icon ?? "📄"}</span>

        {/* Name or rename input */}
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") {
                setRenameValue(page.name);
                setIsRenaming(false);
              }
            }}
            className={cn(
              "flex-1 min-w-0 bg-white border border-gray-300 rounded px-1.5 py-0.5",
              "text-sm text-gray-900 outline-none focus:ring-1 focus:ring-gray-400",
            )}
          />
        ) : (
          <span
            className="flex-1 truncate cursor-pointer select-none"
            onClick={onClick}
            onDoubleClick={() => {
              setIsRenaming(true);
              setRenameValue(page.name);
            }}
          >
            {page.name}
          </span>
        )}

        {/* More actions button — visible on hover or when menu is open */}
        {!isRenaming && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
              setShowDeleteConfirm(false);
            }}
            className={cn(
              "shrink-0 w-5 h-5 flex items-center justify-center rounded",
              "text-gray-400 hover:text-gray-700 hover:bg-gray-200",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              showMenu && "opacity-100",
            )}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className={cn(
            "absolute left-0 top-full mt-0.5 z-50 w-44",
            "bg-white border border-gray-200 rounded-lg shadow-lg py-1",
          )}
        >
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={() => {
                  setIsRenaming(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="w-3.5 h-3.5" />
                Rename
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </>
          ) : (
            // Confirmation step — prevents accidental deletes
            <div className="px-3 py-2">
              <p className="text-xs text-gray-600 mb-2">
                Delete <span className="font-medium">"{page.name}"</span>? This
                cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
