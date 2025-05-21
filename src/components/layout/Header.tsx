
import React from "react";
import { Bell, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();
  
  // Mock notifications for demo
  const notifications = [
    { id: 1, text: "Neuer Termin: Kundengespräch um 14:00 Uhr", time: "vor 10 Minuten", read: false },
    { id: 2, text: "Verpasster Anruf von Kunde #12345", time: "vor 30 Minuten", read: false },
    { id: 3, text: "Vertrag #87654 läuft in 5 Tagen ab", time: "vor 1 Stunde", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="border-b border-border bg-white dark:bg-card px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      
      <div className="flex items-center space-x-4">
        {showCallButton && user?.role === "telefonist" && (
          <Button 
            onClick={onCallButtonClick}
            className="call-button bg-keyeff-500 hover:bg-keyeff-600"
          >
            <Phone className="mr-2" size={18} />
            Anruf starten
          </Button>
        )}
      
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-keyeff-500"
                  variant="default"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b">
              <h3 className="font-medium">Benachrichtigungen</h3>
            </div>
            {notifications.length > 0 ? (
              <ul className="divide-y">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className={`p-3 hover:bg-muted cursor-pointer ${!notification.read ? "bg-accent" : ""}`}
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
      </div>
    </header>
  );
};
