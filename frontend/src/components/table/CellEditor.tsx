import type { Column } from "@/stores/columnsStore";

type CellEditorProps = {
  column: Column;
  rowId: string;
  value: string | null;
};

export function CellEditor({ value }: CellEditorProps) {
  return (
    <div className="min-h-7flex items-center text-sm text-gray-900 px-1">
      {value ?? <span className="text-gray-300 text-xs">Empty</span>}
    </div>
  );
}
