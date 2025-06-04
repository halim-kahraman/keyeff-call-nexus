import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/api";
import { toast } from "sonner";

interface NewCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filialeId?: string | null;
  campaignId?: string | null;
}

export function NewCustomerDialog({ open, onOpenChange, filialeId, campaignId }: NewCustomerDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    mobile_phone: "",
    address: "",
    city: "",
    postal_code: "",
    notes: "",
    priority: "medium"
  });

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: (customerData: any) => customerService.createCustomer(customerData),
    onSuccess: () => {
      toast.success('Kunde erfolgreich erstellt');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        mobile_phone: "",
        address: "",
        city: "",
        postal_code: "",
        notes: "",
        priority: "medium"
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Fehler beim Erstellen des Kunden');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name) {
      toast.error("Name ist ein Pflichtfeld");
      return;
    }
    
    // Submit customer data
    createCustomerMutation.mutate({
      ...formData,
      filiale_id: filialeId || undefined,
      campaign_id: campaignId || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neuen Kunden anlegen</DialogTitle>
          <DialogDescription>
            Geben Sie die Kundendaten ein. Felder mit * sind Pflichtfelder.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name / Ansprechpartner *</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Firma</Label>
              <Input 
                id="company" 
                name="company" 
                value={formData.company} 
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile_phone">Mobiltelefon</Label>
              <Input 
                id="mobile_phone" 
                name="mobile_phone" 
                value={formData.mobile_phone} 
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priorität</Label>
              <Select 
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priorität wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse</Label>
              <Input 
                id="address" 
                name="address" 
                value={formData.address} 
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postal_code">PLZ</Label>
              <Input 
                id="postal_code" 
                name="postal_code" 
                value={formData.postal_code} 
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Ort</Label>
              <Input 
                id="city" 
                name="city" 
                value={formData.city} 
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notizen</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-keyeff-500 hover:bg-keyeff-600"
            >
              {isSubmitting ? "Wird gespeichert..." : "Kunde anlegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
