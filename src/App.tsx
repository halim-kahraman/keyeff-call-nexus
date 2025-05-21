
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import RequireAuth from "@/context/RequireAuth";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CallPanel from "./pages/CallPanel";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Calendar from "./pages/Calendar";
import Contacts from "./pages/Contacts";
import Statistics from "./pages/Statistics";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } 
            />
            
            <Route 
              path="/call" 
              element={
                <RequireAuth allowedRoles={["telefonist", "filialleiter"]}>
                  <CallPanel />
                </RequireAuth>
              } 
            />

            <Route 
              path="/calendar" 
              element={
                <RequireAuth>
                  <Calendar />
                </RequireAuth>
              } 
            />

            <Route 
              path="/contacts" 
              element={
                <RequireAuth allowedRoles={["telefonist", "filialleiter"]}>
                  <Contacts />
                </RequireAuth>
              } 
            />

            <Route 
              path="/statistics" 
              element={
                <RequireAuth allowedRoles={["admin", "filialleiter"]}>
                  <Statistics />
                </RequireAuth>
              } 
            />

            <Route 
              path="/logs" 
              element={
                <RequireAuth allowedRoles={["admin"]}>
                  <Logs />
                </RequireAuth>
              } 
            />

            <Route 
              path="/settings" 
              element={
                <RequireAuth allowedRoles={["admin", "filialleiter"]}>
                  <Settings />
                </RequireAuth>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
