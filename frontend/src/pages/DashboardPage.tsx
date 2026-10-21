import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePagesStore } from "@/stores/pagesStore";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const { user } = useUser();
  const { pages, createPage } = usePagesStore();
  const navigate = useNavigate();

  // Show most recently created pages first, max 6
  const recentPages = [...pages]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  async function handleCreatePage() {
    const newPage = await createPage("Untitled");
    navigate(`/pages/${newPage.id}`);
  }

  const greeting = getGreeting();

  return (
    <PageTransition>
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ background: "var(--color-bg)" }}
      >
        {/* Header */}
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
            {greeting}, {user?.firstName ?? "there"}!
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {pages.length === 0
              ? "Create your first tracker to get started."
              : `You have ${pages.length} ${pages.length === 1 ? "page" : "pages"}.`}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {pages.length === 0 ? (
            // First time empty state
            <FirstTimeEmptyState onCreatePage={handleCreatePage} />
          ) : (
            <div className="max-w-3xl space-y-8">
              {/* Quick actions */}
              <section>
                <h2
                  className="text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: "var(--color-text-faint)" }}
                >
                  Quick actions
                </h2>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={handleCreatePage}
                  >
                    New page
                  </Button>
                </div>
              </section>

              {/* Recent pages */}
              <section>
                <h2
                  className="text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: "var(--color-text-faint)" }}
                >
                  Recent pages
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {recentPages.map((page, index) => (
                    <motion.button
                      key={page.id}
                      onClick={() => navigate(`/pages/${page.id}`)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.18 }}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl text-left",
                        "border transition-all group",
                      )}
                      style={{
                        background: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="text-2xl shrink-0">
                        {page.icon ?? "📄"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {page.name}
                        </p>
                        <p
                          className="text-xs mt-0.5 flex items-center gap-1"
                          style={{ color: "var(--color-text-faint)" }}
                        >
                          <Clock className="w-3 h-3" />
                          {formatDate(page.createdAt)}
                        </p>
                      </div>
                      <ArrowRight
                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        style={{ color: "var(--color-text-faint)" }}
                      />
                    </motion.button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

// ─── First time empty state ───────────────────────────────────────────────────

function FirstTimeEmptyState({ onCreatePage }: { onCreatePage: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-64">
      <motion.div
        className="text-center max-w-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Illustration */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-2xl rotate-6 opacity-30"
            style={{ background: "var(--color-surface-2)" }}
          />
          <div
            className="absolute inset-0 rounded-2xl -rotate-3 opacity-50"
            style={{ background: "var(--color-surface-2)" }}
          />
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: "var(--color-surface)" }}
          >
            📊
          </div>
        </div>

        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Welcome to Tracker
        </h2>
        <p
          className="text-sm mb-6 leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          Create pages to track anything — habits, expenses, projects, books.
          Each page has a customizable table and dashboard.
        </p>

        <Button
          variant="primary"
          size="lg"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onCreatePage}
        >
          Create your first page
        </Button>

        {/* Feature hints */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-left">
          {[
            {
              emoji: "📋",
              title: "Custom columns",
              desc: "Text, numbers, dates, selects",
            },
            {
              emoji: "📈",
              title: "Live charts",
              desc: "Bar, line, pie, KPI cards",
            },
            {
              emoji: "⚡",
              title: "Instant sync",
              desc: "Changes save automatically",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-3 rounded-xl"
              style={{ background: "var(--color-surface-2)" }}
            >
              <div className="text-xl mb-1.5">{feature.emoji}</div>
              <p
                className="text-xs font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {feature.title}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--color-text-faint)" }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
