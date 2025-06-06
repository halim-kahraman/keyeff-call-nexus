
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { filialeService, userService } from '@/services/api';

export const useFilialen = () => {
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

  return {
    filialen,
    users,
    isLoading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    activeFiliale,
    formData,
    setFormData,
    handleAddFiliale,
    handleUpdateFiliale,
    handleEdit,
    handleDelete
  };
};
