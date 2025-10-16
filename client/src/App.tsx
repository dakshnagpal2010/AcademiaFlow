import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { StaffModeProvider } from "@/contexts/staff-mode-context";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import SignUp from "@/pages/signup";
import SignIn from "@/pages/signin";
import Dashboard from "@/pages/dashboard";
import Schedule from "@/pages/schedule";
import Classes from "@/pages/classes";
import Homework from "@/pages/homework";
import Calendar from "@/pages/calendar";
import Plans from "@/pages/plans";
import DailyPlanner from "@/pages/daily-planner";
import Settings from "@/pages/settings";
import AIAssistant from "@/pages/ai-assistant";
import Sidebar from "@/components/sidebar";

function AuthenticatedLayout() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex min-h-screen bg-dark-primary">
      <Sidebar />
      <div className={`ml-16 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-80'} flex-1 transition-all duration-300 w-full overflow-x-hidden max-w-full`}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/classes" component={Classes} />
          <Route path="/homework" component={Homework} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/plans" component={Plans} />
          <Route path="/daily-planner" component={DailyPlanner} />
          <Route path="/ai-assistant" component={AIAssistant} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  return (
    <StaffModeProvider>
      <SidebarProvider>
        <AuthenticatedLayout />
      </SidebarProvider>
    </StaffModeProvider>
  );
}

function UnauthenticatedApp() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/signup" component={SignUp} />
      <Route path="/signin" component={SignIn} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading AcademiaFlow...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
