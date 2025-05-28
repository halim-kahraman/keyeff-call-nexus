
import React, { useState } from "react";
import { Bell, Phone, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/context/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { UserProfileDialog } from "@/components/user/UserProfileDialog";
import { useNotifications } from "@/hooks/useNotifications";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showCallButton?: boolean;
  onCallButtonClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle,
  showCallButton = false,
  onCallButtonClick
}) => {
  const { user, logout } = useAuth();
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleNotificationsOpen = (open: boolean) => {
    setIsNotificationsOpen(open);
    if (!open && unreadCount > 0) {
      // Mark all as read when closing if there were unread notifications
      markAllAsRead();
    }
  };

  return (
    <>
      <header className="border-b border-border bg-white dark:bg-card px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm w-full">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          {showCallButton && user?.role === "telefonist" && (
            <Button 
              onClick={onCallButtonClick}
              className="call-button bg-primary hover:bg-primary/90"
            >
              <Phone className="mr-2" size={18} />
              Anruf starten
            </Button>
          )}
        
          <Popover open={isNotificationsOpen} onOpenChange={handleNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 z-50 bg-white" align="end">
              <div className="p-3 border-b flex justify-between items-center">
                <h3 className="font-medium">Benachrichtigungen</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Alle lesen
                  </Button>
                )}
              </div>
              {notifications.length > 0 ? (
                <ul className="divide-y">
                  {notifications.map((notification) => (
                    <li 
                      key={notification.id} 
                      className={`p-3 hover:bg-muted cursor-pointer transition-colors ${!notification.read ? "bg-accent" : ""}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <p className="text-sm">{notification.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-center text-muted-foreground">
                  Keine Benachrichtigungen
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getUserInitials()}`} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{getUserInitials()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 bg-white">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsUserProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                  <Settings className="mr-2 h-4 w-4" />
                  Einstellungen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      
      <UserProfileDialog 
        open={isUserProfileOpen} 
        onOpenChange={setIsUserProfileOpen} 
      />
    </>
  );
};
