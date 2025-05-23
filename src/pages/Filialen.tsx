
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Building, PlusCircle, Edit, Trash2, Map } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Dummy data for demo
const mockFilialen = [
  { id: "1", name: "Zentrale", address: "Hauptstr. 1, 10115 Berlin", phoneNumber: "+49 30 1234567", email: "zentrale@keyeff.de" },
  { id: "2", name: "Berlin", address: "Berliner Str. 15, 10115 Berlin", phoneNumber: "+49 30 9876543", email: "berlin@keyeff.de" },
  { id: "3", name: "München", address: "Münchner Str. 25, 80333 München", phoneNumber: "+49 89 1234567", email: "muenchen@keyeff.de" },
  { id: "4", name: "Hamburg", address: "Hamburger Str. 35, 20095 Hamburg", phoneNumber: "+49 40 1234567", email: "hamburg@keyeff.de" },
  { id: "5", name: "Köln", address: "Kölner Str. 45, 50667 Köln", phoneNumber: "+49 221 1234567", email: "koeln@keyeff.de" }
];

const Filialen = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeFiliale, setActiveFiliale] = useState<any>(null);

  // Fetch branches
  const { data: filialen = mockFilialen, isLoading } = useQuery({
    queryKey: ['filialen'],
    queryFn: () => Promise.resolve(mockFilialen),
  });

  // Add branch mutation
  const { mutate: addFiliale } = useMutation({
    mutationFn: (filialeData: any) => {
      // In real app, call API to add branch
      return Promise.resolve({ ...filialeData, id: Date.now().toString() });
    },
    onSuccess: () => {
      setIsAddDialogOpen(false);
      toast.success("Filiale erfolgreich erstellt");
    },
    onError: () => {
      toast.error("Fehler beim Erstellen der Filiale");
    }
  });

  // Edit branch mutation
  const { mutate: updateFiliale } = useMutation({
    mutationFn: (filialeData: any) => {
      // In real app, call API to update branch
      return Promise.resolve(filialeData);
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      toast.success("Filiale erfolgreich aktualisiert");
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren der Filiale");
    }
  });

  // Delete branch mutation
  const { mutate: deleteFiliale } = useMutation({
    mutationFn: (filialeId: string) => {
      // In real app, call API to delete branch
      return Promise.resolve(filialeId);
    },
    onSuccess: () => {
      toast.success("Filiale erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Filiale");
    }
  });

  const handleAddFiliale = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const filialeData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      email: formData.get('email') as string,
    };
    
    addFiliale(filialeData);
  };

  const handleUpdateFiliale = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const filialeData = {
      id: activeFiliale.id,
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      email: formData.get('email') as string,
    };
    
    updateFiliale(filialeData);
  };

  const handleEdit = (filiale: any) => {
    setActiveFiliale(filiale);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (filialeId: string) => {
    if (window.confirm("Sind Sie sicher, dass Sie diese Filiale löschen möchten?")) {
      deleteFiliale(filialeId);
    }
  };

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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Neue Filiale erstellen</DialogTitle>
              <DialogDescription>
                Geben Sie die Informationen für die neue Filiale ein.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddFiliale}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">Adresse</Label>
                  <Textarea id="address" name="address" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phoneNumber" className="text-right">Telefon</Label>
                  <Input id="phoneNumber" name="phoneNumber" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">E-Mail</Label>
                  <Input id="email" name="email" type="email" className="col-span-3" />
                </div>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Lade Filialen...</TableCell>
                  </TableRow>
                ) : (
                  filialen.map(filiale => (
                    <TableRow key={filiale.id}>
                      <TableCell className="font-medium">{filiale.name}</TableCell>
                      <TableCell>{filiale.address}</TableCell>
                      <TableCell>{filiale.phoneNumber}</TableCell>
                      <TableCell>{filiale.email}</TableCell>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filiale bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Informationen für {activeFiliale?.name}.
            </DialogDescription>
          </DialogHeader>
          {activeFiliale && (
            <form onSubmit={handleUpdateFiliale}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Name</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={activeFiliale.name} 
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-address" className="text-right">Adresse</Label>
                  <Textarea 
                    id="edit-address" 
                    name="address" 
                    defaultValue={activeFiliale.address} 
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phoneNumber" className="text-right">Telefon</Label>
                  <Input 
                    id="edit-phoneNumber" 
                    name="phoneNumber" 
                    defaultValue={activeFiliale.phoneNumber} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">E-Mail</Label>
                  <Input 
                    id="edit-email" 
                    name="email" 
                    type="email" 
                    defaultValue={activeFiliale.email} 
                    className="col-span-3" 
                  />
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

export default Filialen;
