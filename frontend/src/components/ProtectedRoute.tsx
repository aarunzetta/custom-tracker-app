import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { usePagesStore } from "@/stores/pagesStore";

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const fetchPages = usePagesStore((state) => state.fetchPages);

  useEffect(() => {
    if (isSignedIn) {
      fetchPages();
    }
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}
