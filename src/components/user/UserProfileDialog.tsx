
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export function UserProfileDialog({ open, onOpenChange, user }: UserProfileDialogProps) {
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSaveProfile = () => {
    // Mock function - in a real app this would call an API
    toast({
      title: "Profil aktualisiert",
      description: "Ihre Profileinstellungen wurden erfolgreich aktualisiert."
    });
    onOpenChange(false);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Fehler",
        description: "Die neuen Passwörter stimmen nicht überein.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Fehler",
        description: "Das neue Passwort muss mindestens 8 Zeichen lang sein.",
        variant: "destructive"
      });
      return;
    }

    // Mock function - in a real app this would call an API
    toast({
      title: "Passwort geändert",
      description: "Ihr Passwort wurde erfolgreich geändert."
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profil bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeiten Sie Ihre Profileinstellungen und ändern Sie Ihr Passwort.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center mb-4">
          <Avatar className="h-20 w-20 mb-2">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getUserInitials()}`} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">
            {user?.role === "admin" ? "Administrator" : user?.role === "filialleiter" ? "Filialleiter" : "Telefonist"}
          </p>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              E-Mail
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <Button onClick={handleSaveProfile} className="w-full">
          Profil speichern
        </Button>

        <div className="mt-6">
          <h3 className="font-medium text-lg mb-2">Passwort ändern</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleChangePassword} variant="outline" className="w-full">
              Passwort ändern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
