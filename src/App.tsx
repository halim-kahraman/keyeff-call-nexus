
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import RequireAuth from "@/context/RequireAuth";

// Pages
import Index from "./pages/Index";
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
import WhatsAppTemplates from "./pages/WhatsAppTemplates";

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
              {/* Landing/redirect page */}
              <Route path="/" element={<Index />} />
              
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes - General Users */}
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/customers" element={<RequireAuth><Customers /></RequireAuth>} />
              <Route path="/call" element={<RequireAuth><CallPanel /></RequireAuth>} />
              <Route path="/call/:id" element={<RequireAuth><CallPanel /></RequireAuth>} />
              <Route path="/calendar" element={<RequireAuth><Calendar /></RequireAuth>} />
              <Route path="/statistics" element={<RequireAuth><Statistics /></RequireAuth>} />
              
              {/* Admin Routes */}
              <Route path="/admin/tools" element={<RequireAuth allowedRoles={['admin']}><AdminTools /></RequireAuth>} />
              <Route path="/admin/users" element={<RequireAuth allowedRoles={['admin']}><UserManagement /></RequireAuth>} />
              <Route path="/admin/filialen" element={<RequireAuth allowedRoles={['admin']}><Filialen /></RequireAuth>} />
              <Route path="/admin/logs" element={<RequireAuth allowedRoles={['admin']}><Logs /></RequireAuth>} />
              
              {/* Admin or Filialleiter Routes */}
              <Route path="/settings" element={<RequireAuth allowedRoles={['admin', 'filialleiter']}><Settings /></RequireAuth>} />
              <Route path="/templates" element={<RequireAuth allowedRoles={['admin', 'filialleiter']}><Templates /></RequireAuth>} />
              <Route path="/whatsapp-templates" element={<RequireAuth allowedRoles={['admin', 'filialleiter']}><WhatsAppTemplates /></RequireAuth>} />
              
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
