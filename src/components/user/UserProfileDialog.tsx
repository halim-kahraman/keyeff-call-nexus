
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";

interface UserProfileDialogProps {
  trigger: React.ReactNode;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({ trigger }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    // Here would be actual API call to update profile
    toast.success("Profil erfolgreich aktualisiert");
    setIsOpen(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For demo purposes, just create a URL from the file
      // In a real app, you'd upload this to a server
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Profil bearbeiten</DialogTitle>
          <DialogDescription>
            Ändern Sie Ihre Profileinstellungen hier.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatar ? (
                    <AvatarImage src={avatar} alt={name} />
                  ) : (
                    <AvatarFallback className="text-lg">{name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                {avatar && (
                  <Button 
                    type="button"
                    size="icon" 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full" 
                    onClick={removeAvatar}
                  >
                    <X size={12} />
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="avatar" className="cursor-pointer flex items-center gap-2 text-sm px-3 py-1 bg-muted rounded-md hover:bg-muted/80">
                  <Camera size={16} />
                  <span>Avatar ändern</span>
                </Label>
                <Input 
                  id="avatar" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">E-Mail</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="col-span-3" 
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Passwort</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Neues Passwort eingeben" 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword" className="text-right">Wiederholen</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Passwort bestätigen" 
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Änderungen speichern</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
