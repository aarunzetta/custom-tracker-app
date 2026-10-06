import { create } from "zustand";
import { api } from "@/lib/api";

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

export const usePagesStore = create<PagesStore>((set) => ({
  pages: [],
  isLoading: false,

  fetchPages: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/pages");
      set({ pages: res.data });
    } finally {
      set({ isLoading: false });
    }
  },

  createPage: async (name: string) => {
    const res = await api.post("/pages", { name });
    const newPage: Page = res.data;
    // Add to local state immediately — no need to refetch
    set((state) => ({ pages: [...state.pages, newPage] }));
    return newPage;
  },

  updatePage: async (id, data) => {
    await api.patch(`/pages/${id}`, data);
    set((state) => ({
      pages: state.pages.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
  },

  deletePage: async (id) => {
    await api.delete(`/pages/${id}`);
    set((state) => ({
      pages: state.pages.filter((p) => p.id !== id),
    }));
  },
}));
