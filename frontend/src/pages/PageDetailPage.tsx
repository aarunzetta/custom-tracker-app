import { useParams } from "react-router-dom";
import { usePagesStore } from "@/stores/pagesStore";

export function PageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { pages } = usePagesStore();

  const page = pages.find((p) => p.id === id);

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Page not found
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{page.icon ?? "📄"}</span>
          <h1 className="text-2xl font-semibold text-gray-900">{page.name}</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Dashboard coming soon. Add columns to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
