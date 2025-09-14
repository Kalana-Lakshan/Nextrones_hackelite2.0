import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
const CreateRoadmap = React.lazy(() => import("./pages/CreateRoadmap"));
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import TodoList from "./pages/TodoList";
import NotFound from "./pages/NotFound";
import SavedRoadmaps from "./pages/SavedRoadmaps";
import ChatbotPage from "./pages/Chatbot";
import GitHubCallback from "./pages/GitHubCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/saved" element={<SavedRoadmaps />} />
            <Route path="/todolist" element={<TodoList />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/github-callback" element={<GitHubCallback />} />
            <Route
              path="/create-roadmap"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <CreateRoadmap />
                </Suspense>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
