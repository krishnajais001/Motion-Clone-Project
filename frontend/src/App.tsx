import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import AppPage from '@/pages/AppPage';
import HomePage from '@/pages/HomePage';
import PageView from '@/pages/PageView';
import SettingsPage from '@/pages/SettingsPage';
import TasksPage from '@/pages/TasksPage';
import CalendarPage from '@/pages/CalendarPage';
import StudyPage from '@/pages/StudyPage';
import WhiteboardPage from '@/pages/WhiteboardPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useUIStore } from '@/stores/useUIStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/** Keeps the <html> `dark` class in sync with the theme store. */
function ThemeWatcher() {
  const theme = useUIStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeWatcher />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected app routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="page/:id" element={<PageView />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="study" element={<StudyPage />} />
            <Route path="whiteboard" element={<WhiteboardPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Redirect root to /app (ProtectedRoute will handle auth) */}
          <Route path="/" element={<Navigate to="/app" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
