
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { UserProfileDialog } from "@/components/user/UserProfileDialog";
import {
  Home,
  Users,
  Phone,
  Calendar,
  BarChart2,
  Settings,
  FileText,
  LogOut,
  User,
  Building2,
  Clock,
  Cog,
  Menu
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const MobileNav = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isUserProfileOpen, setIsUserProfileOpen] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavLink = ({
    to,
    icon: Icon,
    children,
    onClick,
  }: {
    to?: string;
    icon: any;
    children: React.ReactNode;
    onClick?: () => void;
  }) => {
    const handleClick = () => {
      setIsSheetOpen(false);
      if (onClick) onClick();
    };

    const content = (
      <div
        className={cn(
          "flex items-center w-full py-3 px-4 my-1 rounded-md transition-colors",
          "hover:bg-blue-700",
          onClick || isActive(to || "")
            ? "bg-blue-700 text-white"
            : "text-white/90"
        )}
      >
        <Icon className="h-5 w-5 mr-3" />
        <span className="font-medium">{children}</span>
      </div>
    );

    if (onClick) {
      return (
        <button className="w-full text-left" onClick={handleClick}>
          {content}
        </button>
      );
    }

    if (!to) return <div>{content}</div>;

    return <Link to={to} onClick={() => setIsSheetOpen(false)}>{content}</Link>;
  };

  const isAdmin = user?.role === "admin";
  const isFilialleiter = user?.role === "filialleiter";

  return (
    <>
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-blue-600 text-white border-blue-700 p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-blue-700">
                <h1 className="text-xl font-bold">KeyEff CallPanel</h1>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <NavLink to="/" icon={Home}>
                  Dashboard
                </NavLink>
                <NavLink to="/customers" icon={Users}>
                  Kunden
                </NavLink>
                <NavLink to="/call" icon={Phone}>
                  Anruf
                </NavLink>
                <NavLink to="/calendar" icon={Calendar}>
                  Kalender
                </NavLink>
                <NavLink to="/statistics" icon={BarChart2}>
                  Statistiken
                </NavLink>

                {/* Admin section */}
                {(isAdmin || isFilialleiter) && (
                  <div className="mt-6">
                    <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                      Administration
                    </h2>
                    {isAdmin && (
                      <>
                        <NavLink to="/admin/tools" icon={Cog}>
                          Admin Tools
                        </NavLink>
                        <NavLink to="/admin/users" icon={User}>
                          Benutzer
                        </NavLink>
                        <NavLink to="/admin/filialen" icon={Building2}>
                          Filialen
                        </NavLink>
                        <NavLink to="/admin/logs" icon={Clock}>
                          Logs
                        </NavLink>
                      </>
                    )}
                  </div>
                )}

                {/* Settings section */}
                <div className="mt-6">
                  <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                    Einstellungen
                  </h2>
                  {(isAdmin || isFilialleiter) && (
                    <>
                      <NavLink to="/settings" icon={Settings}>
                        Allgemein
                      </NavLink>
                      <NavLink to="/templates" icon={FileText}>
                        Vorlagen
                      </NavLink>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-blue-700 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-700 rounded-full w-10 h-10 flex items-center justify-center mr-2">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user?.name || "User"}</div>
                      <div className="text-xs text-white/70">{user?.role || "User"}</div>
                    </div>
                  </div>
                  <div className="flex">
                    <button 
                      onClick={() => {
                        setIsUserProfileOpen(true);
                        setIsSheetOpen(false);
                      }}
                      className="p-2 text-white/80 hover:text-white"
                      title="Profil"
                    >
                      <User size={18} />
                    </button>
                    <button
                      onClick={logout}
                      className="p-2 text-white/80 hover:text-white"
                      title="Abmelden"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <h1 className="text-lg font-bold">KeyEff CallPanel</h1>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </div>
      
      <UserProfileDialog 
        open={isUserProfileOpen} 
        onOpenChange={setIsUserProfileOpen} 
      />
    </>
  );
};
