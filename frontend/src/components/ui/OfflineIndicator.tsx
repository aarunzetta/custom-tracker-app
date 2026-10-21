import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-9999"
        >
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg"
            style={{
              background: "var(--color-text-primary)",
              color: "var(--color-bg)",
            }}
          >
            <WifiOff className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">
              You're offline — changes won't save
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
