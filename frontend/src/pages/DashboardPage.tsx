import { useUser } from "@clerk/clerk-react";

export function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-semibold text-gray-900">Home</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
          </h2>
          <p className="text-gray-400 text-sm">
            Select a page from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
