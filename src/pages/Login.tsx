
import React, { useState, FormEvent, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const Login = () => {
  const location = useLocation();
  const { isAuthenticated, login, isLoading, needsVerification, verify2FA, resetPassword, confirmResetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  // Password reset states
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "code" | "password">("email");
  const [resetLoading, setResetLoading] = useState(false);

  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    console.log('Login component - Auth state:', { isAuthenticated, needsVerification, from });
  }, [isAuthenticated, needsVerification, from]);

  // Handle dialog open and close properly
  useEffect(() => {
    if (!isResetDialogOpen) {
      // Reset state when dialog closes
      setTimeout(() => {
        setResetStep("email");
        setResetEmail("");
        setResetCode("");
        setNewPassword("");
      }, 300);
    }
  }, [isResetDialogOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted for:', email);
    await login(email, password);
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Verifying 2FA code:', code);
    await verify2FA(code);
  };

  const handleResetRequest = async (e: FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const result = await resetPassword(resetEmail);
      console.log("Reset password result:", result);
      if (result && result.success) {
        setResetStep("code");
        toast.success("Reset-Code gesendet", {
          description: "Falls die E-Mail in unserem System existiert, wurde ein Code gesendet."
        });
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
    } finally {
      setResetLoading(false);
    }
  };

  const handleCodeVerification = (e: FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      toast.error("Bitte geben Sie den Reset-Code ein");
      return;
    }
    setResetStep("password");
    toast.info("Code bestätigt", { 
      description: "Bitte geben Sie Ihr neues Passwort ein." 
    });
  };

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.error("Bitte geben Sie ein neues Passwort ein");
      return;
    }
    
    setResetLoading(true);
    try {
      const result = await confirmResetPassword(resetEmail, resetCode, newPassword);
      console.log("Password reset confirmation result:", result);
      if (result && result.success) {
        setIsResetDialogOpen(false);
      }
    } catch (error) {
      console.error("Error confirming password reset:", error);
    } finally {
      setResetLoading(false);
    }
  };

  // If user is authenticated, redirect to the intended page
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
          <Card>
            <CardHeader>
              <CardTitle>Anmelden</CardTitle>
              <CardDescription>
                Bitte melden Sie sich mit Ihrem Benutzerkonto an
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@keyeff.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Passwort</Label>
                    <button 
                      type="button"
                      className="text-xs text-keyeff-500 hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsResetDialogOpen(true);
                      }}
                    >
                      Passwort vergessen?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-keyeff-500 hover:bg-keyeff-600"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Anmelden
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Zwei-Faktor-Authentifizierung</CardTitle>
              <CardDescription>
                Bitte geben Sie den Code ein, der an Ihre E-Mail gesendet wurde
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleVerify}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Bestätigungscode</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button 
                  type="submit" 
                  className="w-full bg-keyeff-500 hover:bg-keyeff-600"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Bestätigen
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => window.location.reload()}
                >
                  Zurück
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
        
        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Passwort zurücksetzen</DialogTitle>
              <DialogDescription>
                {resetStep === "email" && "Bitte geben Sie Ihre E-Mail-Adresse ein, um einen Reset-Code zu erhalten."}
                {resetStep === "code" && "Bitte geben Sie den Code ein, der an Ihre E-Mail-Adresse gesendet wurde."}
                {resetStep === "password" && "Bitte geben Sie Ihr neues Passwort ein."}
              </DialogDescription>
            </DialogHeader>
            
            {resetStep === "email" && (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">E-Mail</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@keyeff.de"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-keyeff-500 hover:bg-keyeff-600"
                    disabled={resetLoading}
                  >
                    {resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Code anfordern
                  </Button>
                </DialogFooter>
              </form>
            )}
            
            {resetStep === "code" && (
              <form onSubmit={handleCodeVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-code">Bestätigungscode</Label>
                  <Input
                    id="reset-code"
                    type="text"
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-keyeff-500 hover:bg-keyeff-600"
                    disabled={resetLoading}
                  >
                    {resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Code bestätigen
                  </Button>
                </DialogFooter>
              </form>
            )}
            
            {resetStep === "password" && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Neues Passwort</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-keyeff-500 hover:bg-keyeff-600"
                    disabled={resetLoading}
                  >
                    {resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Passwort zurücksetzen
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;
