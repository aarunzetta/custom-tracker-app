import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  // Not signed in — redirect to login
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Signed in — render the child route
  return <Outlet />;
}
