import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — anyone can visit */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected routes — must be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>

        {/* Catch-all: redirect unknown URLs to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
