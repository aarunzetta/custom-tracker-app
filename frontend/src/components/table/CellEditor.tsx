import type { Column } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";
import { TextCell } from "./cells/TextCell";
import { NumberCell } from "./cells/NumberCell";
import { CheckboxCell } from "./cells/CheckboxCell";
import { DateCell } from "./cells/DateCell";
import { SelectCell } from "./cells/SelectCell";
import { UrlCell } from "./cells/UrlCell";

type CellEditorProps = {
  column: Column;
  rowId: string;
  value: string | null;
};

export function CellEditor({ column, rowId, value }: CellEditorProps) {
  const { updateCell } = useRowsStore();

  function handleSave(newValue: string | null) {
    // Only save if value actually changed
    if (newValue === value) return;
    updateCell(rowId, column.id, newValue);
  }

  switch (column.type) {
    case "TEXT":
      return <TextCell value={value} onSave={handleSave} />;

    case "NUMBER":
      return <NumberCell value={value} onSave={handleSave} />;

    case "CHECKBOX":
      return <CheckboxCell value={value} onSave={handleSave} />;

    case "DATE":
      return <DateCell value={value} onSave={handleSave} />;

    case "SELECT": {
      const choices =
        (column.options as { choices: string[] } | null)?.choices ?? [];
      return <SelectCell value={value} choices={choices} onSave={handleSave} />;
    }

    case "URL":
      return <UrlCell value={value} onSave={handleSave} />;

    default:
      return (
        <div className="min-h-7 flex items-center text-sm text-gray-400 px-1">
          —
        </div>
      );
  }
}
