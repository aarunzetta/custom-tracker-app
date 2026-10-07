import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { usePagesStore } from "@/stores/pagesStore";

export type PageDetail = {
  id: string;
  name: string;
  icon: string | null;
  createdAt: string;
};

export function usePage(id: string | undefined) {
  const [page, setPage] = useState<PageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const updatePageInStore = usePagesStore((state) => state.updatePage);

  useEffect(() => {
    if (!id) return;

    async function fetchPage() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/pages/${id}`);
        setPage(res.data);
      } catch {
        setError("Page not found");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPage();
  }, [id]);

  async function updatePage(data: Partial<Pick<PageDetail, "name" | "icon">>) {
    if (!page) return;
    // Optimistic update — update UI immediately
    setPage((prev) => (prev ? { ...prev, ...data } : prev));
    // Update sidebar too
    updatePageInStore(page.id, data);
    // Persist to backend
    try {
      await api.patch(`/pages/${page.id}`, data);
    } catch {
      // Rollback on failure
      setPage((prev) => (prev ? { ...prev, ...page } : prev));
    }
  }

  return { page, isLoading, error, updatePage };
}
