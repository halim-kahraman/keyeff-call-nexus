
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { filialeService, userService } from "@/services/api";

const Filialen = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeFiliale, setActiveFiliale] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    manager_id: '',
    status: 'active'
  });
  
  const queryClient = useQueryClient();

  // Fetch branches from database
  const { data: filialen = [], isLoading } = useQuery({
    queryKey: ['filialen'],
    queryFn: async () => {
      const response = await filialeService.getFilialen();
      return response.data || [];
    },
  });

  // Fetch users for manager selection
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userService.getUsers();
      return response.data || [];
    },
  });

  // Add branch mutation
  const { mutate: addFiliale } = useMutation({
    mutationFn: (filialeData: any) => filialeService.createFiliale(filialeData),
    onSuccess: () => {
      setIsAddDialogOpen(false);
      setFormData({ name: '', address: '', city: '', postal_code: '', phone: '', email: '', manager_id: '', status: 'active' });
      queryClient.invalidateQueries({ queryKey: ['filialen'] });
      toast.success("Filiale erfolgreich erstellt");
    },
    onError: () => {
      toast.error("Fehler beim Erstellen der Filiale");
    }
  });

  // Edit branch mutation
  const { mutate: updateFiliale } = useMutation({
    mutationFn: (filialeData: any) => filialeService.updateFiliale(filialeData.id, filialeData),
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setActiveFiliale(null);
      setFormData({ name: '', address: '', city: '', postal_code: '', phone: '', email: '', manager_id: '', status: 'active' });
      queryClient.invalidateQueries({ queryKey: ['filialen'] });
      toast.success("Filiale erfolgreich aktualisiert");
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren der Filiale");
    }
  });

  // Delete branch mutation
  const { mutate: deleteFiliale } = useMutation({
    mutationFn: (filialeId: string) => filialeService.deleteFiliale(filialeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filialen'] });
      toast.success("Filiale erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Filiale");
    }
  });

  const handleAddFiliale = (event: React.FormEvent) => {
    event.preventDefault();
    addFiliale(formData);
  };

  const handleUpdateFiliale = (event: React.FormEvent) => {
    event.preventDefault();
    updateFiliale({ ...formData, id: activeFiliale.id });
  };

  const handleEdit = (filiale: any) => {
    setActiveFiliale(filiale);
    setFormData({
      name: filiale.name || '',
      address: filiale.address || '',
      city: filiale.city || '',
      postal_code: filiale.postal_code || '',
      phone: filiale.phone || '',
      email: filiale.email || '',
      manager_id: filiale.manager_id?.toString() || '',
      status: filiale.status || 'active'
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (filialeId: string) => {
    if (window.confirm("Sind Sie sicher, dass Sie diese Filiale löschen möchten?")) {
      deleteFiliale(filialeId);
    }
  };

  const renderFormFields = () => (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input 
          id="name" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="col-span-3" 
          required 
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="address" className="text-right">Adresse</Label>
        <Textarea 
          id="address" 
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          className="col-span-3" 
          required 
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="city" className="text-right">Stadt</Label>
        <Input 
          id="city" 
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="postal_code" className="text-right">PLZ</Label>
        <Input 
          id="postal_code" 
          value={formData.postal_code}
          onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="phone" className="text-right">Telefon</Label>
        <Input 
          id="phone" 
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">E-Mail</Label>
        <Input 
          id="email" 
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="manager" className="text-right">Manager</Label>
        <Select value={formData.manager_id} onValueChange={(value) => setFormData({...formData, manager_id: value})}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Manager auswählen" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="">Kein Manager</SelectItem>
            {users.filter((user: any) => user.role === 'filialleiter' || user.role === 'admin').map((user: any) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Status auswählen" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="inactive">Inaktiv</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <AppLayout title="Filialen" subtitle="Filialen und Standorte verwalten">
      <div className="admin-controls flex justify-between items-center">
        <div>
          <span className="text-sm font-medium">Filialen gesamt: {filialen.length}</span>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              <span>Neue Filiale</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle>Neue Filiale erstellen</DialogTitle>
              <DialogDescription>
                Geben Sie die Informationen für die neue Filiale ein.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddFiliale}>
              <div className="grid gap-4 py-4">
                {renderFormFields()}
              </div>
              <DialogFooter>
                <Button type="submit">Filiale erstellen</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Stadt</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">Lade Filialen...</TableCell>
                  </TableRow>
                ) : filialen.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">Keine Filialen vorhanden</TableCell>
                  </TableRow>
                ) : (
                  filialen.map((filiale: any) => (
                    <TableRow key={filiale.id}>
                      <TableCell>{filiale.id}</TableCell>
                      <TableCell className="font-medium">{filiale.name}</TableCell>
                      <TableCell>{filiale.address}</TableCell>
                      <TableCell>{filiale.city}</TableCell>
                      <TableCell>{filiale.phone}</TableCell>
                      <TableCell>{filiale.manager_name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${filiale.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {filiale.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(filiale.created_at).toLocaleDateString('de-DE')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(filiale)} title="Bearbeiten">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(filiale.id)} title="Löschen">
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

      {/* Edit Filiale Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Filiale bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Informationen für {activeFiliale?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFiliale}>
            <div className="grid gap-4 py-4">
              {renderFormFields()}
            </div>
            <DialogFooter>
              <Button type="submit">Änderungen speichern</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Filialen;
