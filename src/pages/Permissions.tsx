
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock permissions data
const mockPermissions = [
  {
    id: 1,
    name: "dashboard_view",
    description: "Dashboard anzeigen",
    roles: {
      admin: true,
      filialleiter: true,
      telefonist: true,
    }
  },
  {
    id: 2,
    name: "calls_make",
    description: "Anrufe tätigen",
    roles: {
      admin: true,
      filialleiter: true,
      telefonist: true,
    }
  },
  {
    id: 3,
    name: "calls_log",
    description: "Anrufprotokolle anzeigen",
    roles: {
      admin: true,
      filialleiter: true,
      telefonist: false,
    }
  },
  {
    id: 4,
    name: "customers_view",
    description: "Kunden anzeigen",
    roles: {
      admin: true,
      filialleiter: true,
      telefonist: true,
    }
  },
  {
    id: 5,
    name: "customers_edit",
    description: "Kunden bearbeiten",
    roles: {
      admin: true,
      filialleiter: true,
      telefonist: false,
    }
  },
  {
    id: 6,
    name: "appointments_view",
    description: "Termine anzeigen",
    roles: {
      admin: true,
      filialleiter: true,
      telefonist: true,
    }
  },
  {
    id: 7,
    name: "appointments_create",
    description: "Termine erstellen",
    roles: {
      admin: true,
      filialleiter: true,
      telefonist: true,
    }
  },
  {
    id: 8,
    name: "settings_view",
    description: "Einstellungen anzeigen",
    roles: {
      admin: true,
      filialleiter: true,
      telefonist: false,
    }
  },
  {
    id: 9,
    name: "settings_edit",
    description: "Einstellungen bearbeiten",
    roles: {
      admin: true,
      filialleiter: false,
      telefonist: false,
    }
  },
  {
    id: 10,
    name: "users_manage",
    description: "Benutzer verwalten",
    roles: {
      admin: true,
      filialleiter: false,
      telefonist: false,
    }
  },
  {
    id: 11,
    name: "branches_manage",
    description: "Filialen verwalten",
    roles: {
      admin: true,
      filialleiter: false,
      telefonist: false,
    }
  },
  {
    id: 12,
    name: "permissions_manage",
    description: "Berechtigungen verwalten",
    roles: {
      admin: true,
      filialleiter: false,
      telefonist: false,
    }
  },
  {
    id: 13,
    name: "statistics_view",
    description: "Statistiken anzeigen",
    roles: {
      admin: true,
      filialleiter: true,
      telefonist: false,
    }
  },
  {
    id: 14,
    name: "templates_manage",
    description: "Vorlagen verwalten",
    roles: {
      admin: true,
      filialleiter: false,
      telefonist: false,
    }
  }
];

const Permissions = () => {
  const [permissions, setPermissions] = useState(mockPermissions);
  const [selectedRole, setSelectedRole] = useState("admin");

  // Fetch permissions
  const { data = mockPermissions, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => Promise.resolve(mockPermissions),
  });

  // Save permissions mutation
  const { mutate: savePermissions, isPending: isSaving } = useMutation({
    mutationFn: (perms: typeof permissions) => {
      // In real app, call API to save permissions
      return Promise.resolve(perms);
    },
    onSuccess: () => {
      toast.success("Berechtigungen erfolgreich gespeichert");
    },
    onError: () => {
      toast.error("Fehler beim Speichern der Berechtigungen");
    }
  });

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setPermissions(prev => prev.map(p => {
      if (p.id === permissionId) {
        return {
          ...p,
          roles: {
            ...p.roles,
            [selectedRole]: checked
          }
        };
      }
      return p;
    }));
  };

  const handleSavePermissions = () => {
    savePermissions(permissions);
  };

  return (
    <AppLayout title="Berechtigungen" subtitle="Berechtigungen und Zugriffsrechte für verschiedene Benutzerrollen verwalten">
      <div className="admin-controls flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Label htmlFor="role-select">Rolle auswählen:</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger id="role-select" className="w-[200px]">
              <SelectValue placeholder="Rolle auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="filialleiter">Filialleiter</SelectItem>
              <SelectItem value="telefonist">Telefonist</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          className="flex items-center gap-2" 
          onClick={handleSavePermissions}
          disabled={isSaving}
        >
          <Save size={16} />
          <span>{isSaving ? "Speichere..." : "Änderungen speichern"}</span>
        </Button>
      </div>

      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">Alle Berechtigungen</TabsTrigger>
          <TabsTrigger value="admin">Administration</TabsTrigger>
          <TabsTrigger value="calls">Anrufe</TabsTrigger>
          <TabsTrigger value="customers">Kunden</TabsTrigger>
          <TabsTrigger value="appointments">Termine</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alle Berechtigungen</CardTitle>
              <CardDescription>Verwalten Sie alle verfügbaren Berechtigungen für {selectedRole === 'admin' ? 'Administratoren' : selectedRole === 'filialleiter' ? 'Filialleiter' : 'Telefonisten'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Berechtigung</TableHead>
                      <TableHead>Beschreibung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Lade Berechtigungen...</TableCell>
                      </TableRow>
                    ) : (
                      permissions.map(permission => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <Checkbox 
                              id={`permission-${permission.id}`} 
                              checked={permission.roles[selectedRole as keyof typeof permission.roles]} 
                              onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                              disabled={selectedRole === 'admin' && permission.name === 'permissions_manage'} // Admins must always have this permission
                            />
                          </TableCell>
                          <TableCell>
                            <Label htmlFor={`permission-${permission.id}`} className="font-medium">
                              {permission.name}
                            </Label>
                          </TableCell>
                          <TableCell>{permission.description}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Administrationsberechtigungen</CardTitle>
              <CardDescription>Verwalten von Benutzern, Filialen und systemweiten Einstellungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Berechtigung</TableHead>
                      <TableHead>Beschreibung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions
                      .filter(p => ['users_manage', 'branches_manage', 'permissions_manage', 'settings_edit', 'templates_manage'].includes(p.name))
                      .map(permission => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <Checkbox 
                              id={`admin-${permission.id}`} 
                              checked={permission.roles[selectedRole as keyof typeof permission.roles]} 
                              onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                              disabled={selectedRole === 'admin' && permission.name === 'permissions_manage'} 
                            />
                          </TableCell>
                          <TableCell>
                            <Label htmlFor={`admin-${permission.id}`} className="font-medium">
                              {permission.name}
                            </Label>
                          </TableCell>
                          <TableCell>{permission.description}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calls" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Anrufberechtigungen</CardTitle>
              <CardDescription>Berechtigungen für das Telefonie-System und Anrufprotokolle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Berechtigung</TableHead>
                      <TableHead>Beschreibung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions
                      .filter(p => ['calls_make', 'calls_log'].includes(p.name))
                      .map(permission => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <Checkbox 
                              id={`calls-${permission.id}`} 
                              checked={permission.roles[selectedRole as keyof typeof permission.roles]} 
                              onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Label htmlFor={`calls-${permission.id}`} className="font-medium">
                              {permission.name}
                            </Label>
                          </TableCell>
                          <TableCell>{permission.description}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Kundenberechtigungen</CardTitle>
              <CardDescription>Berechtigungen für die Kundenverwaltung</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Berechtigung</TableHead>
                      <TableHead>Beschreibung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions
                      .filter(p => ['customers_view', 'customers_edit'].includes(p.name))
                      .map(permission => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <Checkbox 
                              id={`customers-${permission.id}`} 
                              checked={permission.roles[selectedRole as keyof typeof permission.roles]} 
                              onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Label htmlFor={`customers-${permission.id}`} className="font-medium">
                              {permission.name}
                            </Label>
                          </TableCell>
                          <TableCell>{permission.description}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appointments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Terminberechtigungen</CardTitle>
              <CardDescription>Berechtigungen für die Terminverwaltung</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Berechtigung</TableHead>
                      <TableHead>Beschreibung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions
                      .filter(p => ['appointments_view', 'appointments_create'].includes(p.name))
                      .map(permission => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <Checkbox 
                              id={`appointments-${permission.id}`} 
                              checked={permission.roles[selectedRole as keyof typeof permission.roles]} 
                              onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Label htmlFor={`appointments-${permission.id}`} className="font-medium">
                              {permission.name}
                            </Label>
                          </TableCell>
                          <TableCell>{permission.description}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Permissions;
