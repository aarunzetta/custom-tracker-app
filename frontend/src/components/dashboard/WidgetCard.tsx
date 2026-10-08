import { useState } from "react";
import { MoreHorizontal, Trash2, Settings2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Widget, useWidgetsStore } from "@/stores/widgetsStore";

type WidgetCardProps = {
  widget: Widget;
  onConfigure: (widget: Widget) => void;
  children: React.ReactNode;
};

export function WidgetCard({ widget, onConfigure, children }: WidgetCardProps) {
  const { deleteWidget } = useWidgetsStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isLarge = widget.config.size === "large";

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-xl overflow-hidden",
        "flex flex-col group",
        isLarge ? "col-span-2" : "col-span-1",
      )}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          {/* Drag handle — visual for now, wired in Day 5 */}
          <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {widget.title}
          </h3>
        </div>

        {/* Actions menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setShowMenu(!showMenu);
              setShowDeleteConfirm(false);
            }}
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded",
              "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
              "opacity-0 group-hover:opacity-100 transition-all",
              showMenu && "opacity-100",
            )}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              {!showDeleteConfirm ? (
                <>
                  <button
                    onClick={() => {
                      onConfigure(widget);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Configure
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
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-600 mb-2">
                    Delete this widget?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        deleteWidget(widget.id);
                        setShowMenu(false);
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart content */}
      <div className="flex-1 p-4 min-h-0">{children}</div>
    </div>
  );
}
