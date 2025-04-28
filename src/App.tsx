
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AppProvider, useApp } from "./contexts/AppContext";

// Import pages
import WelcomePage from "./pages/WelcomePage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import AddTaskPage from "./pages/AddTaskPage";
import EditTaskPage from "./pages/EditTaskPage";
import CalendarPage from "./pages/CalendarPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { LoadingScreen } from "@/components/ui/loading-screen";

const queryClient = new QueryClient();

// Protected route component that checks if the user has completed onboarding
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isOnboarded, profile, isLoading } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isOnboarded) {
    return <Navigate to="/" replace />;
  }

  if (isOnboarded && !profile) {
    return <Navigate to="/profile/setup" replace />;
  }

  return <>{children}</>;
};

// Route component that redirects to dashboard if user is already onboarded
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { isOnboarded, profile, isLoading } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (isOnboarded && profile) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isOnboarded, profile } = useApp();

  // Effect to determine initial route based on onboarding status
  useEffect(() => {
    console.log("Onboarding status:", { isOnboarded, hasProfile: !!profile });
  }, [isOnboarded, profile]);

  return (
    <Routes>
      {/* Onboarding routes */}
      <Route 
        path="/" 
        element={
          <OnboardingRoute>
            <WelcomePage />
          </OnboardingRoute>
        } 
      />
      <Route 
        path="/profile/setup" 
        element={
          <OnboardingRoute>
            <ProfileSetupPage />
          </OnboardingRoute>
        }
      />
      
      {/* App routes (protected) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/tasks/add" 
        element={
          <ProtectedRoute>
            <AddTaskPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/tasks/edit/:taskId" 
        element={
          <ProtectedRoute>
            <EditTaskPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/progress" 
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
