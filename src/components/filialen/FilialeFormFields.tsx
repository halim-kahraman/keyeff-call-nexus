
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilialeFormFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  users: any[];
}

export const FilialeFormFields: React.FC<FilialeFormFieldsProps> = ({
  formData,
  setFormData,
  users
}) => {
  return (
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
};
