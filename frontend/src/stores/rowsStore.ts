import { create } from "zustand";
import { api } from "@/lib/api";

export type TableRow = {
  id: string;
  pageId: string;
  createdAt: string;
  cells: Record<string, { id: string; value: string | null }>;
};

// Tracks the save state of individual cells
// Key format: "rowId:columnId"
type CellSaveState = "idle" | "saving" | "error";

type RowsStore = {
  rows: TableRow[];
  isLoading: boolean;
  cellStates: Record<string, CellSaveState>;
  fetchRows: (pageId: string) => Promise<void>;
  createRow: (pageId: string) => Promise<TableRow>;
  deleteRow: (id: string) => Promise<void>;
  updateCell: (
    rowId: string,
    columnId: string,
    value: string | null,
  ) => Promise<void>;
  getCellState: (rowId: string, columnId: string) => CellSaveState;
};

export const useRowsStore = create<RowsStore>((set, get) => ({
  rows: [],
  isLoading: false,
  cellStates: {},

  fetchRows: async (pageId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/pages/${pageId}/rows`);
      set({ rows: res.data });
    } finally {
      set({ isLoading: false });
    }
  },

  createRow: async (pageId) => {
    const res = await api.post(`/pages/${pageId}/rows`);
    const newRow: TableRow = res.data;
    set((state) => ({ rows: [...state.rows, newRow] }));
    return newRow;
  },

  deleteRow: async (id) => {
    set((state) => ({ rows: state.rows.filter((r) => r.id !== id) }));
    await api.delete(`/rows/${id}`);
  },

  updateCell: async (rowId, columnId, value) => {
    const cellKey = `${rowId}:${columnId}`;

    // Optimistic update
    set((state) => ({
      rows: state.rows.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          cells: {
            ...row.cells,
            [columnId]: {
              id: row.cells[columnId]?.id ?? "",
              value,
            },
          },
        };
      }),
      cellStates: { ...state.cellStates, [cellKey]: "saving" },
    }));

    try {
      await api.patch("/cells", { rowId, columnId, value });
      // Success — clear the saving state
      set((state) => {
        const newStates = { ...state.cellStates };
        delete newStates[cellKey];
        return { cellStates: newStates };
      });
    } catch {
      // Failed — mark as error so UI can show retry
      set((state) => ({
        cellStates: { ...state.cellStates, [cellKey]: "error" },
      }));
    }
  },

  getCellState: (rowId, columnId) => {
    const key = `${rowId}:${columnId}`;
    return get().cellStates[key] ?? "idle";
  },
}));
