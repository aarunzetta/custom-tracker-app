import { create } from "zustand";
import { api } from "@/lib/api";

export type ColumnType =
  | "TEXT"
  | "NUMBER"
  | "DATE"
  | "CHECKBOX"
  | "SELECT"
  | "URL";

export type Column = {
  id: string;
  name: string;
  type: ColumnType;
  order: number;
  options: { choices: string[] } | null;
  pageId: string;
  createdAt: string;
};

type ColumnsStore = {
  columns: Column[];
  isLoading: boolean;
  fetchColumns: (pageId: string) => Promise<void>;
  createColumn: (
    pageId: string,
    data: { name: string; type: ColumnType; options?: { choices: string[] } },
  ) => Promise<Column>;
  updateColumn: (
    id: string,
    data: Partial<Pick<Column, "name" | "options" | "order">>,
  ) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  reorderColumns: (
    pageId: string,
    fromOrder: number,
    toOrder: number,
  ) => Promise<void>;
};

export const useColumnsStore = create<ColumnsStore>((set, get) => ({
  columns: [],
  isLoading: false,

  fetchColumns: async (pageId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/pages/${pageId}/columns`);
      set({ columns: res.data });
    } finally {
      set({ isLoading: false });
    }
  },

  createColumn: async (pageId, data) => {
    const res = await api.post(`/pages/${pageId}/columns`, data);
    const newColumn: Column = res.data;
    set((state) => ({
      columns: [...state.columns, newColumn].sort((a, b) => a.order - b.order),
    }));
    return newColumn;
  },

  updateColumn: async (id, data) => {
    // Optimistic update
    set((state) => ({
      columns: state.columns.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
    await api.patch(`/columns/${id}`, data);
  },

  deleteColumn: async (id) => {
    await api.delete(`/columns/${id}`);
    set((state) => ({
      columns: state.columns
        .filter((c) => c.id !== id)
        .map((c, index) => ({ ...c, order: index })),
    }));
  },

  reorderColumns: async (pageId, fromOrder, toOrder) => {
    // Optimistic reorder in the UI
    const columns = [...get().columns];
    const moving = columns.find((c) => c.order === fromOrder);
    if (!moving) return;

    // Shift other columns
    const reordered = columns
      .map((c) => {
        if (c.id === moving.id) return { ...c, order: toOrder };
        if (fromOrder < toOrder) {
          if (c.order > fromOrder && c.order <= toOrder)
            return { ...c, order: c.order - 1 };
        } else {
          if (c.order >= toOrder && c.order < fromOrder)
            return { ...c, order: c.order + 1 };
        }
        return c;
      })
      .sort((a, b) => a.order - b.order);

    set({ columns: reordered });

    // Persist to backend
    await api.patch(`/columns/${moving.id}`, { order: toOrder });
  },
}));
