
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
import AdminTools from "./pages/AdminTools";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes */}
              <Route element={<RequireAuth>{() => <></>}</RequireAuth>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/call" element={<CallPanel />} />
                <Route path="/call/:id" element={<CallPanel />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/statistics" element={<Statistics />} />
                
                {/* Admin Routes */}
                <Route element={<RequireAuth allowedRoles={['admin']}>{() => <></>}</RequireAuth>}>
                  <Route path="/admin/tools" element={<AdminTools />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/filialen" element={<Filialen />} />
                  <Route path="/admin/logs" element={<Logs />} />
                </Route>
                
                {/* Admin or Filialleiter Routes */}
                <Route element={<RequireAuth allowedRoles={['admin', 'filialleiter']}>{() => <></>}</RequireAuth>}>
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/templates" element={<Templates />} />
                </Route>
              </Route>
              
              {/* Catch all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
