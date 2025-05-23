
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ReactNode } from "react";
import { User } from "./types/auth.types";

interface RequireAuthProps {
  children: ReactNode | ((props: { user: User }) => ReactNode);
  allowedRoles?: string[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User doesn't have required role, redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Return the outlet (child routes) wrapped in the children function if provided
  return (
    <>
      {typeof children === 'function' && user 
        ? children({ user }) 
        : children}
      <Outlet />
    </>
  );
};

export default RequireAuth;
