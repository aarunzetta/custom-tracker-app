import { create } from "zustand";
import { api } from "@/lib/api";
import { notify } from "@/lib/errors";

export type TableRow = {
  id: string;
  pageId: string;
  createdAt: string;
  cells: Record<string, { id: string; value: string | null }>;
};

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
    } catch (error) {
      notify.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  createRow: async (pageId) => {
    try {
      const res = await api.post(`/pages/${pageId}/rows`);
      const newRow: TableRow = res.data;
      set((state) => ({ rows: [...state.rows, newRow] }));
      return newRow;
    } catch (error) {
      notify.error(error);
      throw error;
    }
  },

  deleteRow: async (id) => {
    const previous = get().rows;
    set((state) => ({ rows: state.rows.filter((r) => r.id !== id) }));
    try {
      await api.delete(`/rows/${id}`);
    } catch (error) {
      set({ rows: previous });
      notify.error(error);
    }
  },

  updateCell: async (rowId, columnId, value) => {
    const cellKey = `${rowId}:${columnId}`;

    // Save previous cell value for rollback
    const previousRows = get().rows;

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
      set((state) => {
        const newStates = { ...state.cellStates };
        delete newStates[cellKey];
        return { cellStates: newStates };
      });
    } catch (error) {
      // Rollback cell value
      set((state) => ({
        rows: previousRows,
        cellStates: { ...state.cellStates, [cellKey]: "error" },
      }));
      notify.error(error);
    }
  },

  getCellState: (rowId, columnId) => {
    const key = `${rowId}:${columnId}`;
    return get().cellStates[key] ?? "idle";
  },
}));
