
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
import Customers from "./pages/Customers";
import Statistics from "./pages/Statistics";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";

// Admin Pages
import UserManagement from "./pages/UserManagement";
import Filialen from "./pages/Filialen";
import Permissions from "./pages/Permissions";
import Templates from "./pages/Templates";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes - Any authenticated user */}
            <Route path="/" element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            } />
            
            {/* Protected routes - Any authenticated user */}
            <Route path="/call" element={
              <RequireAuth>
                <CallPanel />
              </RequireAuth>
            } />
            
            {/* Protected routes - Any authenticated user */}
            <Route path="/calendar" element={
              <RequireAuth>
                <Calendar />
              </RequireAuth>
            } />
            
            {/* Protected routes - Any authenticated user */}
            <Route path="/customers" element={
              <RequireAuth>
                <Customers />
              </RequireAuth>
            } />
            
            {/* Protected routes - Admin and Filialleiter only */}
            <Route path="/statistics" element={
              <RequireAuth allowedRoles={["admin", "filialleiter"]}>
                <Statistics />
              </RequireAuth>
            } />
            
            {/* Protected routes - Admin only */}
            <Route path="/logs" element={
              <RequireAuth allowedRoles={["admin"]}>
                <Logs />
              </RequireAuth>
            } />
            
            {/* Protected routes - Admin and Filialleiter only */}
            <Route path="/settings" element={
              <RequireAuth allowedRoles={["admin", "filialleiter"]}>
                <Settings />
              </RequireAuth>
            } />
            
            {/* Admin routes */}
            <Route path="/users" element={
              <RequireAuth allowedRoles={["admin"]}>
                <UserManagement />
              </RequireAuth>
            } />
            
            <Route path="/filialen" element={
              <RequireAuth allowedRoles={["admin"]}>
                <Filialen />
              </RequireAuth>
            } />
            
            <Route path="/permissions" element={
              <RequireAuth allowedRoles={["admin"]}>
                <Permissions />
              </RequireAuth>
            } />
            
            <Route path="/templates" element={
              <RequireAuth allowedRoles={["admin"]}>
                <Templates />
              </RequireAuth>
            } />
            
            {/* Catch all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
