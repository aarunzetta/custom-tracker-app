import { toast } from "sonner";
import axios from "axios";

// Extracts a readable message from any error type
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Backend sent a structured error
    const serverMessage = error.response?.data?.error;
    if (serverMessage) return serverMessage;

    // Network errors
    if (!error.response) return "Network error. Check your connection.";

    // HTTP status codes
    switch (error.response.status) {
      case 401:
        return "You need to sign in to do that.";
      case 403:
        return "You don't have permission to do that.";
      case 404:
        return "That item no longer exists.";
      case 500:
        return "Something went wrong on the server.";
      default:
        return `Request failed (${error.response.status})`;
    }
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}

// Standardized toast helpers
export const notify = {
  success: (message: string) => toast.success(message),
  error: (error: unknown) => toast.error(getErrorMessage(error)),
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string | number) => toast.dismiss(id),
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error?: string },
  ) =>
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: (err) => messages.error ?? getErrorMessage(err),
    }),
};
