import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define validation schemas
const profileFormSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  role: z.string().optional(),
  filiale: z.string().optional().nullable(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Aktuelles Passwort ist erforderlich"),
  newPassword: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Die Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function UserProfileDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "",
      filiale: user?.filiale || null,
    }
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  // Update profile form values when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        filiale: user.filiale || null,
      });
    }
  }, [user, profileForm.reset]);

  // Profile update mutation
  const { mutate: updateProfile, isPending: isProfileUpdating } = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // This would be a real API call in production
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

  // Password change mutation
  const { mutate: changePassword, isPending: isPasswordUpdating } = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      // This would be a real API call in production
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast.success("Passwort erfolgreich geändert");
      passwordForm.reset();
    },
    onError: () => {
      toast.error("Fehler beim Ändern des Passworts");
    }
  });

  const handleProfileSubmit = (values: ProfileFormValues) => {
    updateProfile(values);
  };

  const handlePasswordSubmit = (values: PasswordFormValues) => {
    changePassword(values);
  };
  
  const getUserInitials = () => {
    if (!user?.name) return "U";
    
    const nameParts = user.name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    
    return nameParts[0][0];
  };

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
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rolle</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {user?.filiale && (
                  <FormField
                    control={profileForm.control}
                    name="filiale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Filiale</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <DialogFooter>
                  <Button type="submit" disabled={isProfileUpdating}>
                    {isProfileUpdating ? "Speichern..." : "Profil speichern"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="password">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aktuelles Passwort</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neues Passwort</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passwort bestätigen</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={isPasswordUpdating}>
                    {isPasswordUpdating ? "Speichern..." : "Passwort ändern"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
