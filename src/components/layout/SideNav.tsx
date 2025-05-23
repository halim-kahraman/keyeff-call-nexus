
import {
  HomeIcon,
  LayoutDashboard,
  Settings as SettingsIcon,
  User2 as UserIcon,
  Calendar as CalendarIcon,
  Phone as PhoneIcon,
  Users2 as Users2Icon,
  Building as BuildingIcon,
  ListChecks as ListChecksIcon,
  History as HistoryIcon,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export function SideNav() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation()
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsMenuOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col h-full bg-primary text-primary-foreground w-64 border-r border-primary/20 fixed left-0 top-0 bottom-0 overflow-y-auto z-30">
      <div className="px-6 py-4">
        <Link to="/dashboard">
          <h1 className="font-bold text-2xl">KeyEff CallPanel</h1>
        </Link>
      </div>
      <Separator className="bg-primary/20" />
      <div className="flex flex-col flex-1">
        <nav className="flex-1 space-y-1 p-2">
          <Button
            variant={pathname === "/" || pathname === "/dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground data-[state=active]:bg-secondary data-[state=active]:text-primary"
            asChild
          >
            <Link to="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant={pathname === "/customers" ? "secondary" : "ghost"}
            className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground data-[state=active]:bg-secondary data-[state=active]:text-primary"
            asChild
          >
            <Link to="/customers">
              <Users2Icon className="mr-2 h-4 w-4" />
              Kunden
            </Link>
          </Button>
          <Button
            variant={pathname.startsWith("/call") ? "secondary" : "ghost"}
            className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground data-[state=active]:bg-secondary data-[state=active]:text-primary"
            asChild
          >
            <Link to="/call">
              <PhoneIcon className="mr-2 h-4 w-4" />
              Anruf
            </Link>
          </Button>
          <Button
            variant={pathname === "/calendar" ? "secondary" : "ghost"}
            className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground data-[state=active]:bg-secondary data-[state=active]:text-primary"
            asChild
          >
            <Link to="/calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Kalender
            </Link>
          </Button>
          <Button
            variant={pathname === "/statistics" ? "secondary" : "ghost"}
            className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground data-[state=active]:bg-secondary data-[state=active]:text-primary"
            asChild
          >
            <Link to="/statistics">
              <ListChecksIcon className="mr-2 h-4 w-4" />
              Statistiken
            </Link>
          </Button>
          
          {/* Admin Section */}
          {user?.role === "admin" && (
            <>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary-foreground/90">
                  Administration
                </h2>
                <div className="space-y-1">
                  <Button
                    variant={pathname === "/admin/tools" ? "secondary" : "ghost"}
                    className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground data-[state=active]:bg-secondary data-[state=active]:text-primary"
                    asChild
                  >
                    <Link to="/admin/tools">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Admin Tools
                    </Link>
                  </Button>
                  <Button
                    variant={pathname === "/admin/users" ? "secondary" : "ghost"}
                    className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground data-[state=active]:bg-secondary data-[state=active]:text-primary"
                    asChild
                  >
                    <Link to="/admin/users">
                      <Users2Icon className="mr-2 h-4 w-4" />
                      Benutzer
                    </Link>
                  </Button>
                  <Button
                    variant={pathname === "/admin/filialen" ? "secondary" : "ghost"}
                    className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground data-[state=active]:bg-secondary data-[state=active]:text-primary"
                    asChild
                  >
                    <Link to="/admin/filialen">
                      <BuildingIcon className="mr-2 h-4 w-4" />
                      Filialen
                    </Link>
                  </Button>
                  <Button
                    variant={pathname === "/admin/logs" ? "secondary" : "ghost"}
                    className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground data-[state=active]:bg-secondary data-[state=active]:text-primary"
                    asChild
                  >
                    <Link to="/admin/logs">
                      <HistoryIcon className="mr-2 h-4 w-4" />
                      Logs
                    </Link>
                  </Button>
                </div>
              </div>
              <Separator className="bg-primary/20" />
            </>
          )}
          
          {/* Settings Section */}
          {(user?.role === "admin" || user?.role === "filialleiter") && (
            <>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary-foreground/90">
                  Einstellungen
                </h2>
                <div className="space-y-1">
                  <Button
                    variant={pathname === "/settings" ? "secondary" : "ghost"}
                    className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground data-[state=active]:bg-secondary data-[state=active]:text-primary"
                    asChild
                  >
                    <Link to="/settings">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Allgemein
                    </Link>
                  </Button>
                  <Button
                    variant={pathname === "/templates" ? "secondary" : "ghost"}
                    className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground data-[state=active]:bg-secondary data-[state=active]:text-primary"
                    asChild
                  >
                    <Link to="/templates">
                      <HomeIcon className="mr-2 h-4 w-4" />
                      Vorlagen
                    </Link>
                  </Button>
                </div>
              </div>
              <Separator className="bg-primary/20" />
            </>
          )}
        </nav>
      </div>
      <div className="p-4 mt-auto">
        {user && (
          <div className="flex items-center space-x-3 mb-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer border-2 border-primary-foreground">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getUserInitials()}`} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">{getUserInitials()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => alert('Profil bearbeiten')}>Profil bearbeiten</DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('Passwort ändern')}>Passwort ändern</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Abmelden</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-primary-foreground">{user.name}</p>
              <p className="text-xs text-primary-foreground/80 truncate">{user.role === "admin" ? "Administrator" : user.role === "filialleiter" ? "Filialleiter" : "Telefonist"}</p>
            </div>
          </div>
        )}
        <Button variant="outline" className="w-full border-primary-foreground/20 text-primary-foreground hover:text-primary hover:bg-primary-foreground" onClick={logout}>
          <span className="text-primary-foreground hover:text-primary">Logout</span>
        </Button>
      </div>
    </div>
  )
}
