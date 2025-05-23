
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, User, UserPlus, Edit, Trash2, UserCog } from "lucide-react";

// Dummy data for demo
const mockUsers = [
  { id: 1, name: "Max Mustermann", email: "max@keyeff.de", role: "admin", filiale: "Zentrale", status: "active" },
  { id: 2, name: "Maria Schmidt", email: "maria@keyeff.de", role: "telefonist", filiale: "Berlin", status: "active" },
  { id: 3, name: "Peter Meyer", email: "peter@keyeff.de", role: "filialleiter", filiale: "München", status: "active" },
  { id: 4, name: "Anna Weber", email: "anna@keyeff.de", role: "telefonist", filiale: "Hamburg", status: "inactive" },
  { id: 5, name: "Thomas Klein", email: "thomas@keyeff.de", role: "telefonist", filiale: "Köln", status: "pending" }
];

// Dummy data for branches
const mockFilialen = [
  { id: "1", name: "Zentrale", address: "Hauptstr. 1, 10115 Berlin" },
  { id: "2", name: "Berlin", address: "Berliner Str. 15, 10115 Berlin" },
  { id: "3", name: "München", address: "Münchner Str. 25, 80333 München" },
  { id: "4", name: "Hamburg", address: "Hamburger Str. 35, 20095 Hamburg" },
  { id: "5", name: "Köln", address: "Kölner Str. 45, 50667 Köln" }
];

const UserManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);

  // Fetch users
  const { data: users = mockUsers, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => Promise.resolve(mockUsers),
  });

  // Fetch branches
  const { data: filialenData } = useQuery({
    queryKey: ['filialen'],
    queryFn: () => Promise.resolve(mockFilialen),
  });

  // Ensure filialen is always an array, even if the API response structure changes
  const filialen = Array.isArray(filialenData) ? filialenData : mockFilialen;

  // Add user mutation
  const { mutate: addUser } = useMutation({
    mutationFn: (userData: any) => {
      // In real app, call API to add user
      return Promise.resolve({ ...userData, id: Date.now() });
    },
    onSuccess: () => {
      setIsAddDialogOpen(false);
      toast.success("Benutzer erfolgreich erstellt");
    },
    onError: () => {
      toast.error("Fehler beim Erstellen des Benutzers");
    }
  });

  // Edit user mutation
  const { mutate: updateUser } = useMutation({
    mutationFn: (userData: any) => {
      // In real app, call API to update user
      return Promise.resolve(userData);
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      toast.success("Benutzer erfolgreich aktualisiert");
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren des Benutzers");
    }
  });

  // Delete user mutation
  const { mutate: deleteUser } = useMutation({
    mutationFn: (userId: number) => {
      // In real app, call API to delete user
      return Promise.resolve(userId);
    },
    onSuccess: () => {
      toast.success("Benutzer erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen des Benutzers");
    }
  });

  const handleAddUser = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      filiale: formData.get('filiale') as string,
      status: 'pending'
    };
    
    addUser(userData);
  };

  const handleUpdateUser = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const userData = {
      id: activeUser.id,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      filiale: formData.get('filiale') as string,
      status: formData.get('status') as string
    };
    
    updateUser(userData);
  };

  const handleEdit = (user: any) => {
    setActiveUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (userId: number) => {
    if (window.confirm("Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?")) {
      deleteUser(userId);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center"><span className="status-indicator status-active"></span>Aktiv</span>;
      case 'inactive':
        return <span className="inline-flex items-center"><span className="status-indicator status-inactive"></span>Inaktiv</span>;
      case 'pending':
        return <span className="inline-flex items-center"><span className="status-indicator status-pending"></span>Ausstehend</span>;
      default:
        return status;
    }
  };
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'filialleiter':
        return 'Filialleiter';
      case 'telefonist':
        return 'Telefonist';
      default:
        return role;
    }
  };

  return (
    <AppLayout title="Benutzerverwaltung" subtitle="Benutzerkonten verwalten und Berechtigungen zuweisen">
      <div className="admin-controls flex justify-between items-center">
        <div>
          <span className="text-sm font-medium">Benutzer gesamt: {users.length}</span>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={16} />
              <span>Neuer Benutzer</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
              <DialogDescription>
                Geben Sie die Benutzerinformationen ein. Ein temporäres Passwort wird automatisch erstellt und dem Benutzer per E-Mail zugesendet.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">E-Mail</Label>
                  <Input id="email" name="email" type="email" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Rolle</Label>
                  <Select name="role" defaultValue="telefonist">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Rolle auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="filialleiter">Filialleiter</SelectItem>
                      <SelectItem value="telefonist">Telefonist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="filiale" className="text-right">Filiale</Label>
                  <Select name="filiale">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Filiale auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {filialen.map(filiale => (
                        <SelectItem key={filiale.id} value={filiale.name}>
                          {filiale.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Benutzer erstellen</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">Alle Benutzer</TabsTrigger>
          <TabsTrigger value="admin">Administratoren</TabsTrigger>
          <TabsTrigger value="filialleiter">Filialleiter</TabsTrigger>
          <TabsTrigger value="telefonist">Telefonisten</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Rolle</TableHead>
                      <TableHead>Filiale</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Lade Benutzer...</TableCell>
                      </TableRow>
                    ) : (
                      users.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleLabel(user.role)}</TableCell>
                          <TableCell>{user.filiale}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Bearbeiten">
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} title="Löschen">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
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
            <CardContent className="pt-6">
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Filiale</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(user => user.role === 'admin').map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.filiale}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Bearbeiten">
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} title="Löschen">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filialleiter" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Filiale</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(user => user.role === 'filialleiter').map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.filiale}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Bearbeiten">
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} title="Löschen">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="telefonist" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Filiale</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(user => user.role === 'telefonist').map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.filiale}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Bearbeiten">
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} title="Löschen">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Informationen für {activeUser?.name}.
            </DialogDescription>
          </DialogHeader>
          {activeUser && (
            <form onSubmit={handleUpdateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Name</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={activeUser.name} 
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">E-Mail</Label>
                  <Input 
                    id="edit-email" 
                    name="email" 
                    type="email" 
                    defaultValue={activeUser.email} 
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">Rolle</Label>
                  <Select name="role" defaultValue={activeUser.role}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Rolle auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="filialleiter">Filialleiter</SelectItem>
                      <SelectItem value="telefonist">Telefonist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-filiale" className="text-right">Filiale</Label>
                  <Select name="filiale" defaultValue={activeUser.filiale}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Filiale auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {filialen.map(filiale => (
                        <SelectItem key={filiale.id} value={filiale.name}>
                          {filiale.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">Status</Label>
                  <Select name="status" defaultValue={activeUser.status}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Status auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="inactive">Inaktiv</SelectItem>
                      <SelectItem value="pending">Ausstehend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Änderungen speichern</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default UserManagement;
