import { useState } from "react";
import { X, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type HintBannerProps = {
  onAddChart: () => void;
};

export function HintBanner({ onAddChart }: HintBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div
            className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-center gap-3"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            <BarChart2
              className="w-4 h-4 shrink-0"
              style={{ color: "var(--color-text-muted)" }}
            />
            <p
              className="flex-1 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              You have data but no charts yet.{" "}
              <button
                onClick={onAddChart}
                className="font-medium underline underline-offset-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Add your first chart
              </button>{" "}
              to visualize it.
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-(--color-border) transition-colors"
              style={{ color: "var(--color-text-faint)" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
