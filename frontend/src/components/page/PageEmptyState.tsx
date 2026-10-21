import { motion } from "framer-motion";
import { Table2, BarChart2, Plus, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageEmptyStateProps = {
  onOpenData: () => void;
};

export function PageEmptyState({ onOpenData }: PageEmptyStateProps) {
  const steps = [
    {
      icon: <Table2 className="w-5 h-5" />,
      title: "Open the data panel",
      desc: 'Click "Open data" in the top right to reveal your table.',
    },
    {
      icon: <Plus className="w-5 h-5" />,
      title: "Add columns",
      desc: "Define what you want to track — text, numbers, dates, and more.",
    },
    {
      icon: <BarChart2 className="w-5 h-5" />,
      title: "Add rows and charts",
      desc: "Fill in your data, then create charts to visualize it here.",
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <h3
          className="text-lg font-semibold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          This page is empty
        </h3>
        <p
          className="text-sm mb-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          Follow these steps to start tracking data.
        </p>

        {/* Steps */}
        <div className="text-left space-y-2 mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.2 }}
            >
              <div
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: "var(--color-surface-2)" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-surface)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        background: "var(--color-border)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {index + 1}
                    </span>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {step.title}
                    </p>
                  </div>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--color-text-faint)" }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown
                    className="w-4 h-4"
                    style={{ color: "var(--color-border-strong)" }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Table2 className="w-4 h-4" />}
          onClick={onOpenData}
        >
          Open data panel
        </Button>
      </motion.div>
    </div>
  );
}
