import { create } from "zustand";
import { api } from "@/lib/api";

export type WidgetType = "bar" | "line" | "kpi" | "pie";
export type WidgetSize = "small" | "large";

export type WidgetConfig = {
  xColumnId?: string;
  yColumnId?: string;
  aggregation?: "count" | "sum" | "avg";
  size?: WidgetSize;
  filter?: {
    columnId: string;
    value: string;
  };
};

export type Widget = {
  id: string;
  title: string;
  type: WidgetType;
  config: WidgetConfig;
  position: number;
  pageId: string;
  createdAt: string;
};

type WidgetsStore = {
  widgets: Widget[];
  isLoading: boolean;
  fetchWidgets: (pageId: string) => Promise<void>;
  createWidget: (
    pageId: string,
    data: { title: string; type: WidgetType; config: WidgetConfig },
  ) => Promise<Widget>;
  updateWidget: (
    id: string,
    data: Partial<Pick<Widget, "title" | "config" | "position">>,
  ) => Promise<void>;
  deleteWidget: (id: string) => Promise<void>;
};

export const useWidgetsStore = create<WidgetsStore>((set) => ({
  widgets: [],
  isLoading: false,

  fetchWidgets: async (pageId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/pages/${pageId}/widgets`);
      set({ widgets: res.data });
    } finally {
      set({ isLoading: false });
    }
  },

  createWidget: async (pageId, data) => {
    const res = await api.post(`/pages/${pageId}/widgets`, data);
    const newWidget: Widget = res.data;
    set((state) => ({
      widgets: [...state.widgets, newWidget],
    }));
    return newWidget;
  },

  updateWidget: async (id, data) => {
    // Optimistic update
    set((state) => ({
      widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...data } : w)),
    }));
    await api.patch(`/widgets/${id}`, data);
  },

  deleteWidget: async (id) => {
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
    }));
    await api.delete(`/widgets/${id}`);
  },
}));
