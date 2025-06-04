
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('Index page - Auth state:', { 
      isLoading, 
      isAuthenticated, 
      user: user ? { id: user.id, name: user.name, role: user.role } : null 
    });

    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log('User is authenticated, redirecting to dashboard');
        navigate("/dashboard", { replace: true });
      } else {
        console.log('User is not authenticated, redirecting to login');
        navigate("/login", { replace: true });
      }
    }
  }, [user, isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-4xl font-bold mb-4">KeyEff Call Panel</h1>
          <p className="text-xl text-gray-600">Authentifizierung wird überprüft...</p>
        </div>
      </div>
    );
  }

  // This should not be reached, but provide a fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">KeyEff Call Panel</h1>
        <p className="text-xl text-gray-600">Wird weitergeleitet...</p>
      </div>
    </div>
  );
};

export default Index;
