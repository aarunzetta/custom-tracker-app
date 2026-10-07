import { Type, Hash, Calendar, CheckSquare, List, Link } from "lucide-react";
import type { ColumnType } from "@/stores/columnsStore";

export type ColumnTypeConfig = {
  type: ColumnType;
  label: string;
  description: string;
  icon: React.ReactNode;
};

export const COLUMN_TYPES: ColumnTypeConfig[] = [
  {
    type: "TEXT",
    label: "Text",
    description: "Plain text, names, notes",
    icon: <Type className="w-4 h-4" />,
  },
  {
    type: "NUMBER",
    label: "Number",
    description: "Integers, decimals, counts",
    icon: <Hash className="w-4 h-4" />,
  },
  {
    type: "DATE",
    label: "Date",
    description: "Dates and timestamps",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    type: "CHECKBOX",
    label: "Checkbox",
    description: "True or false values",
    icon: <CheckSquare className="w-4 h-4" />,
  },
  {
    type: "SELECT",
    label: "Select",
    description: "Pick from a list of options",
    icon: <List className="w-4 h-4" />,
  },
  {
    type: "URL",
    label: "URL",
    description: "Web links",
    icon: <Link className="w-4 h-4" />,
  },
];
