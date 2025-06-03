
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { filialeService } from "@/services/api";

const Filialen = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeFiliale, setActiveFiliale] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch branches from database
  const { data: filialen = [], isLoading } = useQuery({
    queryKey: ['filialen'],
    queryFn: async () => {
      const response = await filialeService.getFilialen();
      return response.data || [];
    },
  });

  // Add branch mutation
  const { mutate: addFiliale } = useMutation({
    mutationFn: (filialeData: any) => filialeService.createFiliale(filialeData),
    onSuccess: () => {
      setIsAddDialogOpen(false);
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
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const filialeData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
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
                  <TableHead>Erstellt am</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Lade Filialen...</TableCell>
                  </TableRow>
                ) : filialen.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Keine Filialen vorhanden</TableCell>
                  </TableRow>
                ) : (
                  filialen.map((filiale: any) => (
                    <TableRow key={filiale.id}>
                      <TableCell>{filiale.id}</TableCell>
                      <TableCell className="font-medium">{filiale.name}</TableCell>
                      <TableCell>{filiale.address}</TableCell>
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
