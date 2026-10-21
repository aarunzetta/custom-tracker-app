import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import { ClerkTokenSync } from "./components/ClerkTokenSync";
import "./index.css";
import App from "./App.tsx";
import { OfflineIndicator } from "./components/ui/OfflineIndicator";
import { MotionConfig } from "framer-motion";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing Clerk publishable key. Check your .env file.");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <MotionConfig reducedMotion="user">
        <ClerkTokenSync />
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              fontSize: "13px",
            },
          }}
        />
        <OfflineIndicator />
      </MotionConfig>
    </ClerkProvider>
  </StrictMode>,
);
