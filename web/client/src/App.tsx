import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import AgentsPage from "./pages/AgentsPage";
import TasksPage from "./pages/TasksPage";
import ProjectsPage from "./pages/ProjectsPage";
import LibraryPage from "./pages/LibraryPage";
import ScheduledPage from "./pages/ScheduledPage";
import SettingsPage from "./pages/SettingsPage";
import KnowledgePage from "./pages/KnowledgePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TerminalPage from "./pages/TerminalPage";
import OpenRouterDashboard from "./pages/OpenRouterDashboard";
import MarketplacePage from "./pages/MarketplacePage";
import { ConnectorsPage } from "./pages/ConnectorsPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/chat"} component={ChatPage} />
      <Route path={"/agents"} component={AgentsPage} />
      <Route path={"/tasks"} component={TasksPage} />
      <Route path={"/projects"} component={ProjectsPage} />
      <Route path={"/library"} component={LibraryPage} />
      <Route path={"/scheduled"} component={ScheduledPage} />
      <Route path={"/knowledge"} component={KnowledgePage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/terminal" component={TerminalPage} />
      <Route path="/openrouter" component={OpenRouterDashboard} />
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/connectors" component={ConnectorsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-slate-50">
                Omni-Agents Studio
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Header actions will go here */}
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <Router />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppLayout />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
