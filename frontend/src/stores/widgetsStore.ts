import { create } from "zustand";
import { api } from "@/lib/api";
import { notify } from "@/lib/errors";

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
    data: Partial<Pick<Widget, "title" | "type" | "config" | "position">>,
  ) => Promise<void>;
  deleteWidget: (id: string) => Promise<void>;
};

export const useWidgetsStore = create<WidgetsStore>((set, get) => ({
  widgets: [],
  isLoading: false,

  fetchWidgets: async (pageId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/pages/${pageId}/widgets`);
      set({ widgets: res.data });
    } catch (error) {
      notify.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  createWidget: async (pageId, data) => {
    try {
      const res = await api.post(`/pages/${pageId}/widgets`, data);
      const newWidget: Widget = res.data;
      set((state) => ({ widgets: [...state.widgets, newWidget] }));
      notify.success(`Chart "${newWidget.title}" created`);
      return newWidget;
    } catch (error) {
      notify.error(error);
      throw error;
    }
  },

  updateWidget: async (id, data) => {
    const previous = get().widgets;
    set((state) => ({
      widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...data } : w)),
    }));
    try {
      await api.patch(`/widgets/${id}`, data);
    } catch (error) {
      set({ widgets: previous });
      notify.error(error);
    }
  },

  deleteWidget: async (id) => {
    const previous = get().widgets;
    const widget = previous.find((w) => w.id === id);
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
    }));
    try {
      await api.delete(`/widgets/${id}`);
      notify.success(`Chart "${widget?.title}" deleted`);
    } catch (error) {
      set({ widgets: previous });
      notify.error(error);
    }
  },
}));
