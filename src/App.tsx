
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useState } from "react";
import RequireAuth from "@/context/RequireAuth";
import { BranchSelectionDialog } from "@/components/dialogs/BranchSelectionDialog";

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

// Admin Pages
import UserManagement from "./pages/UserManagement";
import Filialen from "./pages/Filialen";
import Permissions from "./pages/Permissions";
import Templates from "./pages/Templates";

// Branch selection wrapper component
interface AdminBranchSelectionProps {
  children: React.ReactNode;
}

const AdminBranchSelection: React.FC<AdminBranchSelectionProps> = ({ children }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const location = useLocation();
  
  // Check if a filiale is already selected in the URL
  const searchParams = new URLSearchParams(location.search);
  const hasFiliale = searchParams.has('filiale');
  
  // If admin already selected a branch, render children directly
  if (hasFiliale) {
    return <>{children}</>;
  }
  
  return (
    <>
      <BranchSelectionDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        targetPath={location.pathname}
      />
      {!isDialogOpen && <Navigate to="/" replace />}
    </>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Only use Sonner toast provider */}
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
            
            {/* Call Panel with branch selection for admin */}
            <Route 
              path="/call" 
              element={
                <RequireAuth>
                  {({ user }) => (
                    user?.role === 'admin' ? (
                      <AdminBranchSelection>
                        <CallPanel />
                      </AdminBranchSelection>
                    ) : (
                      <CallPanel />
                    )
                  )}
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

            {/* Contacts with branch selection for admin */}
            <Route 
              path="/contacts" 
              element={
                <RequireAuth>
                  {({ user }) => (
                    user?.role === 'admin' ? (
                      <AdminBranchSelection>
                        <Contacts />
                      </AdminBranchSelection>
                    ) : (
                      <Contacts />
                    )
                  )}
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

            {/* Admin Pages */}
            <Route 
              path="/users" 
              element={
                <RequireAuth allowedRoles={["admin"]}>
                  <UserManagement />
                </RequireAuth>
              } 
            />

            <Route 
              path="/filialen" 
              element={
                <RequireAuth allowedRoles={["admin"]}>
                  <Filialen />
                </RequireAuth>
              } 
            />

            <Route 
              path="/permissions" 
              element={
                <RequireAuth allowedRoles={["admin"]}>
                  <Permissions />
                </RequireAuth>
              } 
            />

            <Route 
              path="/templates" 
              element={
                <RequireAuth allowedRoles={["admin"]}>
                  <Templates />
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
