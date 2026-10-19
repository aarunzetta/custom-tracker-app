import { useUser } from "@clerk/clerk-react";
import { PageTransition } from "@/components/layout/PageTransition";

export function DashboardPage() {
  const { user } = useUser();

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="px-8 py-6 border-b shrink-0"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Home
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2
              className="text-xl font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
            </h2>
            <p style={{ color: "var(--color-text-muted)" }} className="text-sm">
              Select a page from the sidebar or create a new one to get started.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
