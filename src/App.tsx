import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import ApplicationDetail from "./pages/ApplicationDetail";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Internship from "./pages/Internship";
import DiaryDetail from "./pages/DiaryDetail";
import ReflectionDetail from "./pages/ReflectionDetail";
import ResumeBuilder from "./pages/ResumeBuilder";
import Import from "./pages/Import";

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="small-caps">Loading…</p>
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/internship" element={<Internship />} />
        <Route path="/diaries" element={<Navigate to="/internship" replace />} />
        <Route path="/diaries/:id" element={<DiaryDetail />} />
        <Route path="/reflections" element={<Navigate to="/internship" replace />} />
        <Route path="/reflections/:id" element={<ReflectionDetail />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/import" element={<Import />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
