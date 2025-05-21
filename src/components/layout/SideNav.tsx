
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Phone,
  Calendar,
  Users,
  Settings,
  FileText,
  LogOut,
  Menu,
  ChevronLeft,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type NavItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: string[];
};

const navItems: NavItem[] = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/",
    roles: ["admin", "telefonist", "filialleiter"],
  },
  {
    icon: Phone,
    label: "Anrufen",
    href: "/call",
    roles: ["telefonist", "filialleiter"],
  },
  {
    icon: Calendar,
    label: "Termine",
    href: "/calendar",
    roles: ["admin", "telefonist", "filialleiter"],
  },
  {
    icon: Users,
    label: "Kontakte",
    href: "/contacts",
    roles: ["telefonist", "filialleiter"],
  },
  {
    icon: BarChart,
    label: "Statistiken",
    href: "/statistics",
    roles: ["admin", "filialleiter"],
  },
  {
    icon: FileText,
    label: "DSGVO-Logs",
    href: "/logs",
    roles: ["admin"],
  },
  {
    icon: Settings,
    label: "Einstellungen",
    href: "/settings",
    roles: ["admin", "filialleiter"],
  },
];

interface SideNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const SideNav: React.FC<SideNavProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div
      className={cn(
        "h-screen flex flex-col bg-keyeff-500 text-white transition-all duration-300 fixed left-0 top-0 z-40 lg:static",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4">
        <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
          {!collapsed && (
            <span className="text-xl font-bold">KeyEff Call</span>
          )}
          {collapsed && (
            <span className="text-xl font-bold">KCP</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-keyeff-600"
          onClick={onToggle}
        >
          {collapsed ? <Menu /> : <ChevronLeft />}
        </Button>
      </div>

      <Separator className="bg-keyeff-600" />

      <div className="flex flex-col justify-between h-full py-4">
        <nav className="space-y-1 px-2">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  location.pathname === item.href
                    ? "bg-keyeff-600 text-white"
                    : "text-white hover:bg-keyeff-600",
                  collapsed && "justify-center"
                )}
              >
                <item.icon size={20} />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            ))}
        </nav>

        <div className="px-4 mt-auto">
          <div className={cn(
            "flex items-center space-x-3 mb-4",
            collapsed && "flex-col space-x-0 space-y-2"
          )}>
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div>
                <p className="font-medium truncate-text">{user.name}</p>
                <p className="text-xs opacity-70 truncate-text">{user.role}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className="w-full justify-start text-white hover:bg-keyeff-600"
            onClick={logout}
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-2">Abmelden</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};
