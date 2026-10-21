import { create } from "zustand";
import { api } from "@/lib/api";
import { notify } from "@/lib/errors";

export type Page = {
  id: string;
  name: string;
  icon: string | null;
  createdAt: string;
};

type PagesStore = {
  pages: Page[];
  isLoading: boolean;
  fetchPages: () => Promise<void>;
  createPage: (name: string) => Promise<Page>;
  updatePage: (
    id: string,
    data: Partial<Pick<Page, "name" | "icon">>,
  ) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
};

export const usePagesStore = create<PagesStore>((set, get) => ({
  pages: [],
  isLoading: false,

  fetchPages: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/pages");
      set({ pages: res.data });
    } catch (error) {
      notify.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  createPage: async (name) => {
    try {
      const res = await api.post("/pages", { name });
      const newPage: Page = res.data;
      set((state) => ({ pages: [...state.pages, newPage] }));
      return newPage;
    } catch (error) {
      notify.error(error);
      throw error;
    }
  },

  updatePage: async (id, data) => {
    // Save previous state for rollback
    const previous = get().pages;
    // Optimistic update
    set((state) => ({
      pages: state.pages.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
    try {
      await api.patch(`/pages/${id}`, data);
    } catch (error) {
      // Rollback
      set({ pages: previous });
      notify.error(error);
    }
  },

  deletePage: async (id) => {
    const previous = get().pages;
    // Optimistic delete
    set((state) => ({
      pages: state.pages.filter((p) => p.id !== id),
    }));
    try {
      await api.delete(`/pages/${id}`);
      notify.success("Page deleted");
    } catch (error) {
      // Rollback
      set({ pages: previous });
      notify.error(error);
    }
  },
}));
