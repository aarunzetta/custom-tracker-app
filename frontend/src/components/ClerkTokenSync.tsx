import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { registerGetToken } from "../lib/api";

export function ClerkTokenSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Register Clerk's getToken once at app startup
    // Now every axios request will automatically have the Bearer token
    registerGetToken(getToken);
  }, [getToken]);

  return null;
}
