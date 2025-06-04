
import React, { useState, useEffect, FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetRequest: (email: string) => Promise<any>;
  onConfirmReset: (email: string, code: string, password: string) => Promise<any>;
}

export const PasswordResetDialog = ({
  open,
  onOpenChange,
  onResetRequest,
  onConfirmReset
}: PasswordResetDialogProps) => {
  const [resetStep, setResetStep] = useState<"email" | "code" | "password">("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setResetStep("email");
        setResetEmail("");
        setResetCode("");
        setNewPassword("");
      }, 300);
    }
  }, [open]);

  const handleResetRequest = async (e: FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const result = await onResetRequest(resetEmail);
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
      const result = await onConfirmReset(resetEmail, resetCode, newPassword);
      console.log("Password reset confirmation result:", result);
      if (result && result.success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error confirming password reset:", error);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
};
