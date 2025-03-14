
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { OnboardingProvider } from "@/hooks/useOnboarding";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Teams from "./pages/Teams";
import Calendar from "./pages/Calendar";
import Messages from "./pages/Messages";
import Reports from "./pages/Reports";
import Tasks from "./pages/Tasks"; // Import the Tasks page
import Productivity from "./pages/Productivity";
import ProtectedRoute from "./components/ProtectedRoute";

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Error boundary component to prevent app crashes
class AppErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="p-6 max-w-md mx-auto bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-4">The application encountered an error. Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <OnboardingProvider>
                <TooltipProvider>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/onboarding" element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    } />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/teams" element={
                      <ProtectedRoute>
                        <Teams />
                      </ProtectedRoute>
                    } />
                    <Route path="/calendar" element={
                      <ProtectedRoute>
                        <Calendar />
                      </ProtectedRoute>
                    } />
                    <Route path="/messages" element={
                      <ProtectedRoute>
                        <Messages />
                      </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                      <ProtectedRoute>
                        <Reports />
                      </ProtectedRoute>
                    } />
                    <Route path="/tasks" element={
                      <ProtectedRoute>
                        <Tasks />
                      </ProtectedRoute>
                    } />
                    <Route path="/productivity" element={
                      <ProtectedRoute>
                        <Productivity />
                      </ProtectedRoute>
                    } />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </OnboardingProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
};

export default App;
