
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
  BarChart,
  Database,
  Shield,
  Mail,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserProfileDialog } from "@/components/user/UserProfileDialog";

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
    roles: ["admin", "telefonist", "filialleiter"],
  },
  {
    icon: Calendar,
    label: "Termine",
    href: "/calendar",
    roles: ["admin", "telefonist", "filialleiter"],
  },
  {
    icon: Users,
    label: "Kunden",
    href: "/customers",
    roles: ["admin", "telefonist", "filialleiter"],
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

// Admin-only items
const adminItems: NavItem[] = [
  {
    icon: Users,
    label: "Benutzerverwaltung",
    href: "/users",
    roles: ["admin"],
  },
  {
    icon: Database,
    label: "Filialen",
    href: "/filialen",
    roles: ["admin"],
  },
  {
    icon: Shield,
    label: "Berechtigungen",
    href: "/permissions",
    roles: ["admin"],
  },
  {
    icon: Mail,
    label: "Vorlagen",
    href: "/templates",
    roles: ["admin"],
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

  const isAdmin = user.role === 'admin';
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'filialleiter': return 'Filialleiter';
      case 'telefonist': return 'Telefonist';
      default: return role;
    }
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col bg-keyeff-500 text-white transition-all duration-300 fixed left-0 top-0 z-40 overflow-hidden",
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
          className="text-white hover:bg-keyeff-600 flex-shrink-0"
          onClick={onToggle}
        >
          {collapsed ? <Menu /> : <ChevronLeft />}
        </Button>
      </div>

      <Separator className="bg-keyeff-600" />

      <div className="flex flex-col flex-grow justify-between overflow-y-auto scrollbar-thin scrollbar-thumb-keyeff-600 scrollbar-track-transparent">
        <nav className="space-y-1 p-2">
          {/* Standard navigation items */}
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
                {!collapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
              </Link>
            ))}
          
          {/* Admin section */}
          {isAdmin && (
            <>
              <div className={cn(
                "mt-6 mb-2 px-3 text-xs font-semibold text-gray-300 uppercase tracking-wider",
                collapsed && "text-center"
              )}>
                {!collapsed ? "Administration" : "Admin"}
              </div>
              
              {adminItems.map((item) => (
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
                  {!collapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 mt-auto">
          <UserProfileDialog 
            trigger={
              <div className={cn(
                "flex items-center space-x-3 mb-4 cursor-pointer hover:bg-keyeff-600 rounded-md p-2 transition-colors",
                collapsed && "flex-col space-x-0 space-y-2 items-center"
              )}>
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="overflow-hidden">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-xs opacity-70 truncate">{getRoleDisplayName(user.role)}</p>
                  </div>
                )}
              </div>
            } 
          />
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
