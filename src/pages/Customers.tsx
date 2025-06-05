
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { customerService, filialeService } from "@/services/api";
import { Phone, Mail, User, Building, Calendar, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Customers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFiliale, setSelectedFiliale] = useState<string | null>(null);
  
  const isAdmin = user?.role === "admin";
  const effectiveFiliale = isAdmin ? selectedFiliale : user?.filiale_id?.toString();

  const { data: filialen = [] } = useQuery({
    queryKey: ['filialen'],
    queryFn: async () => {
      const response = await filialeService.getFilialen();
      return response.data || [];
    },
    enabled: isAdmin,
  });

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['customers', effectiveFiliale],
    queryFn: () => customerService.getCustomers(effectiveFiliale),
    enabled: !!effectiveFiliale,
  });

  const handleCall = (customer: any, contactId?: string) => {
    navigate('/call', { 
      state: { 
        customer, 
        contactId 
      } 
    });
  };

  const handleCreateCustomer = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await customerService.createCustomer({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        filiale_id: effectiveFiliale
      });
      
      setIsCreateDialogOpen(false);
      refetch();
      toast.success("Kunde erfolgreich erstellt");
    } catch (error) {
      toast.error("Fehler beim Erstellen des Kunden");
    }
  };

  if (!effectiveFiliale && isAdmin) {
    return (
      <AppLayout title="Kunden" subtitle="Kundenverwaltung">
        <Card>
          <CardHeader>
            <CardTitle>Filiale auswählen</CardTitle>
            <CardDescription>Bitte wählen Sie eine Filiale aus, um Kunden anzuzeigen.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedFiliale || ""} onValueChange={setSelectedFiliale}>
              <SelectTrigger>
                <SelectValue placeholder="Filiale auswählen" />
              </SelectTrigger>
              <SelectContent>
                {filialen.map((filiale: any) => (
                  <SelectItem key={filiale.id} value={filiale.id.toString()}>
                    {filiale.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Kunden" subtitle="Kundenverwaltung">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          {isAdmin && (
            <Select value={selectedFiliale || ""} onValueChange={setSelectedFiliale}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filiale auswählen" />
              </SelectTrigger>
              <SelectContent>
                {filialen.map((filiale: any) => (
                  <SelectItem key={filiale.id} value={filiale.id.toString()}>
                    {filiale.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Neuer Kunde</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Kunden erstellen</DialogTitle>
                <DialogDescription>
                  Geben Sie die Kundendaten ein.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCustomer}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" name="name" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">E-Mail</Label>
                    <Input id="email" name="email" type="email" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Telefon</Label>
                    <Input id="phone" name="phone" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">Adresse</Label>
                    <Input id="address" name="address" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Kunde erstellen</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Lädt Kunden...</div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Keine Kunden gefunden
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.address}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => handleCall(customer)}
                          className="mr-2"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Anrufen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Customers;
