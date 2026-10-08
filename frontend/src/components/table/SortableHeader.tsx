import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Column } from "@/stores/columnsStore";
import { COLUMN_TYPES } from "@/config/columnTypes";

type SortableHeaderProps = {
  column: Column;
};

export function SortableHeader({ column }: SortableHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeConfig = COLUMN_TYPES.find((t) => t.type === column.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1.5 w-full",
        isDragging && "opacity-50",
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0 touch-none"
      >
        <GripVertical className="w-3 h-3" />
      </button>

      {/* Type icon */}
      <span className="text-gray-400 shrink-0">{typeConfig?.icon}</span>

      {/* Column name */}
      <span className="truncate">{column.name}</span>
    </div>
  );
}
