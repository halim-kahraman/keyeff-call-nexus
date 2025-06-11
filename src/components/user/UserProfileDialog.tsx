import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfileForm } from "./profile/UserProfileForm";
import { PasswordChangeForm } from "./profile/PasswordChangeForm";

export function UserProfileDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("profile");

  const { mutate: updateProfile, isPending: isProfileUpdating } = useMutation({
    mutationFn: async (data: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, user: { ...user, ...data } });
        }, 1000);
      });
    },
    onSuccess: (data: any) => {
      if (updateUser && user) {
        updateUser({ ...user, ...data.user });
      }
      toast.success("Profil erfolgreich aktualisiert");
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren des Profils");
    }
  });

  const { mutate: changePassword, isPending: isPasswordUpdating } = useMutation({
    mutationFn: async (data: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast.success("Passwort erfolgreich geändert");
    },
    onError: () => {
      toast.error("Fehler beim Ändern des Passworts");
    }
  });
  
  const getUserInitials = () => {
    if (!user?.name) return "U";
    
    const nameParts = user.name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    
    return nameParts[0][0];
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Benutzerprofil</DialogTitle>
          <DialogDescription>
            Ihre persönlichen Einstellungen und Profilinformationen
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4 mb-2">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getUserInitials()}`} />
            <AvatarFallback className="text-xl bg-blue-600 text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="password">Passwort</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <UserProfileForm 
              user={user}
              onSubmit={updateProfile}
              isLoading={isProfileUpdating}
            />
          </TabsContent>
          
          <TabsContent value="password">
            <PasswordChangeForm 
              onSubmit={changePassword}
              isLoading={isPasswordUpdating}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
