import { create } from "zustand";
import { api } from "@/lib/api";

export type TableRow = {
  id: string;
  pageId: string;
  createdAt: string;
  cells: Record<string, { id: string; value: string | null }>;
};

type RowsStore = {
  rows: TableRow[];
  isLoading: boolean;
  fetchRows: (pageId: string) => Promise<void>;
  createRow: (pageId: string) => Promise<TableRow>;
  deleteRow: (id: string) => Promise<void>;
  updateCell: (
    rowId: string,
    columnId: string,
    value: string | null,
  ) => Promise<void>;
};

export const useRowsStore = create<RowsStore>((set) => ({
  rows: [],
  isLoading: false,

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
    // Append to the end of the list immediately
    set((state) => ({ rows: [...state.rows, newRow] }));
    return newRow;
  },

  deleteRow: async (id) => {
    // Optimistic delete — remove from UI before server confirms
    set((state) => ({ rows: state.rows.filter((r) => r.id !== id) }));
    await api.delete(`/rows/${id}`);
  },

  updateCell: async (rowId, columnId, value) => {
    // Optimistic update — update the cell in the UI immediately
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
    }));

    // Persist to backend
    await api.patch("/cells", { rowId, columnId, value });
  },
}));
