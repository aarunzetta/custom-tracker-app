import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { api } from "../lib/api";

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

export function DashboardPage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("/me");
        setProfile(response.data);
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Tracker App</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {user?.firstName ?? profile?.email}
          </span>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
        </h2>
        <p className="text-gray-500 mb-8">Your tracker dashboard is ready.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {profile && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Backend connection
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">DB User ID:</span> {profile.id}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Email:</span> {profile.email}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Member since:</span>{" "}
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
