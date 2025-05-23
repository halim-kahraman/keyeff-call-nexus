
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

  return (
    <div className="flex flex-col h-full bg-secondary w-64 border-r fixed left-0 top-0 bottom-0 overflow-y-auto">
      <div className="px-6 py-4">
        <Link to="/dashboard">
          <h1 className="font-bold text-2xl">KeyEff CallPanel</h1>
        </Link>
      </div>
      <Separator />
      <div className="flex flex-col flex-1">
        <nav className="flex-1 space-y-1 p-2">
          <Button
            variant={pathname === "/" || pathname === "/dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link to="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant={pathname === "/customers" ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link to="/customers">
              <Users2Icon className="mr-2 h-4 w-4" />
              Kunden
            </Link>
          </Button>
          <Button
            variant={pathname.startsWith("/call") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link to="/call">
              <PhoneIcon className="mr-2 h-4 w-4" />
              Anruf
            </Link>
          </Button>
          <Button
            variant={pathname === "/calendar" ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link to="/calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Kalender
            </Link>
          </Button>
          <Button
            variant={pathname === "/statistics" ? "secondary" : "ghost"}
            className="w-full justify-start"
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
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  Administration
                </h2>
                <div className="space-y-1">
                  <Button
                    variant={pathname === "/admin/tools" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/admin/tools">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Admin Tools
                    </Link>
                  </Button>
                  <Button
                    variant={pathname === "/admin/users" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/admin/users">
                      <Users2Icon className="mr-2 h-4 w-4" />
                      Benutzer
                    </Link>
                  </Button>
                  <Button
                    variant={pathname === "/admin/filialen" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/admin/filialen">
                      <BuildingIcon className="mr-2 h-4 w-4" />
                      Filialen
                    </Link>
                  </Button>
                  <Button
                    variant={pathname === "/admin/logs" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/admin/logs">
                      <HistoryIcon className="mr-2 h-4 w-4" />
                      Logs
                    </Link>
                  </Button>
                </div>
              </div>
              <Separator />
            </>
          )}
          
          {/* Settings Section */}
          {(user?.role === "admin" || user?.role === "filialleiter") && (
            <>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  Einstellungen
                </h2>
                <div className="space-y-1">
                  <Button
                    variant={pathname === "/settings" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/settings">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Allgemein
                    </Link>
                  </Button>
                  <Button
                    variant={pathname === "/templates" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/templates">
                      <HomeIcon className="mr-2 h-4 w-4" />
                      Vorlagen
                    </Link>
                  </Button>
                </div>
              </div>
              <Separator />
            </>
          )}
        </nav>
      </div>
      <div className="p-4">
        <Button variant="outline" className="w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  )
}
