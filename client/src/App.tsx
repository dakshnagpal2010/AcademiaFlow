import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Classes from "@/pages/classes";
import Homework from "@/pages/homework";
import Calendar from "@/pages/calendar";
import Settings from "@/pages/settings";
import Sidebar from "@/components/sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-primary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <div className="flex min-h-screen bg-dark-primary">
          <Sidebar />
          <div className="ml-64 flex-1">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/classes" component={Classes} />
              <Route path="/homework" component={Homework} />
              <Route path="/calendar" component={Calendar} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      )}
      {!isAuthenticated && <Route component={NotFound} />}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
