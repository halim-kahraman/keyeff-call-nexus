
import React, { useState, FormEvent, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "./auth/LoginForm";
import { TwoFactorForm } from "./auth/TwoFactorForm";
import { PasswordResetDialog } from "./auth/PasswordResetDialog";

const Login = () => {
  const location = useLocation();
  const { isAuthenticated, login, isLoading, needsVerification, verify2FA, resetPassword, confirmResetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    console.log('Login component - Auth state:', { isAuthenticated, needsVerification, from });
  }, [isAuthenticated, needsVerification, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted for:', email);
    await login(email, password);
  };

  const handleVerificationComplete = async (token: string) => {
    console.log('Verification completed with token');
    // The TwoFactorForm handles the verification internally, 
    // so we don't need to do anything here as the auth context will update
  };

  const handleBack = () => {
    window.location.reload();
  };

  if (isAuthenticated) {
    console.log('User is authenticated, redirecting to:', from);
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-keyeff-500">KeyEff Call Panel</h1>
          <p className="mt-2 text-muted-foreground">Kommunikation und Vertriebssteuerung</p>
        </div>

        {!needsVerification ? (
          <LoginForm
            email={email}
            password={password}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
            onResetClick={() => setIsResetDialogOpen(true)}
          />
        ) : (
          <TwoFactorForm
            email={email}
            onVerificationComplete={handleVerificationComplete}
            onBack={handleBack}
          />
        )}
        
        <PasswordResetDialog
          open={isResetDialogOpen}
          onOpenChange={setIsResetDialogOpen}
          onResetRequest={resetPassword}
          onConfirmReset={confirmResetPassword}
        />
      </div>
    </div>
  );
};

export default Login;
