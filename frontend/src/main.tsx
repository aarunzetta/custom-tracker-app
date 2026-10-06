import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { ClerkTokenSync } from "./components/ClerkTokenSync";
import "./index.css";
import App from "./App.tsx";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing Clerk publishable key. Check your .env file.");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkTokenSync />
      <App />
    </ClerkProvider>
  </StrictMode>,
);
