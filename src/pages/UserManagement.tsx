
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { userService, filialeService } from "@/services/api";

const UserManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch users from API
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  });

  const users = usersResponse?.data || [];

  // Fetch branches
  const { data: filialen = [] } = useQuery({
    queryKey: ['filialen'],
    queryFn: async () => {
      const response = await filialeService.getFilialen();
      return response.data || [];
    },
  });

  // Add user mutation
  const { mutate: addUser } = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Benutzer erfolgreich erstellt");
    },
    onError: () => {
      toast.error("Fehler beim Erstellen des Benutzers");
    }
  });

  // Edit user mutation
  const { mutate: updateUser } = useMutation({
    mutationFn: ({ id, ...userData }: any) => userService.updateUser(id, userData),
    onSuccess: () => {
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Benutzer erfolgreich aktualisiert");
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren des Benutzers");
    }
  });

  // Delete user mutation
  const { mutate: deleteUser } = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      filiale_id: formData.get('filiale') as string,
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
      filiale_id: formData.get('filiale') as string,
    };
    
    updateUser(userData);
  };

  const handleEdit = (user: any) => {
    setActiveUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm("Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?")) {
      deleteUser(userId);
    }
  };
  
  const getStatusBadge = (status: string) => {
    const statusClass = status === 'active' ? 'status-active' : 
                       status === 'inactive' ? 'status-inactive' : 'status-pending';
    const statusText = status === 'active' ? 'Aktiv' : 
                      status === 'inactive' ? 'Inaktiv' : 'Ausstehend';
    
    return (
      <span className="inline-flex items-center">
        <span className={`status-indicator ${statusClass}`}></span>
        {statusText}
      </span>
    );
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

  const filteredUsers = (role: string) => {
    if (role === 'all') return users;
    return users.filter((user: any) => user.role === role);
  };

  const renderUserTable = (userList: any[]) => (
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
        ) : userList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">Keine Benutzer gefunden</TableCell>
          </TableRow>
        ) : (
          userList.map((user: any) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getRoleLabel(user.role)}</TableCell>
              <TableCell>{user.filiale_name || user.filiale || '-'}</TableCell>
              <TableCell>{getStatusBadge('active')}</TableCell>
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
  );

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
                      {filialen.map((filiale: any) => (
                        <SelectItem key={filiale.id} value={filiale.id}>
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
                {renderUserTable(filteredUsers('all'))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="table-container">
                {renderUserTable(filteredUsers('admin'))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filialleiter" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="table-container">
                {renderUserTable(filteredUsers('filialleiter'))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="telefonist" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="table-container">
                {renderUserTable(filteredUsers('telefonist'))}
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
                  <Select name="filiale" defaultValue={activeUser.filiale_id}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Filiale auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {filialen.map((filiale: any) => (
                        <SelectItem key={filiale.id} value={filiale.id}>
                          {filiale.name}
                        </SelectItem>
                      ))}
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
