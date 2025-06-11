
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filialeService, userService } from '@/services/api';
import { toast } from 'sonner';

interface FilialeFormData {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  manager_id: string;
  status: string;
}

export const useFilialen = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeFiliale, setActiveFiliale] = useState<any>(null);
  const [formData, setFormData] = useState<FilialeFormData>({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    manager_id: '',
    status: 'active'
  });

  // Fetch filialen
  const { 
    data: filialen = [], 
    isLoading: filialenLoading 
  } = useQuery({
    queryKey: ['filialen'],
    queryFn: async () => {
      const response = await filialeService.getFilialen();
      return response?.data || [];
    }
  });

  // Fetch users for manager selection
  const { 
    data: users = [] 
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userService.getUsers();
      return response?.data || [];
    }
  });

  // Create filiale mutation
  const createMutation = useMutation({
    mutationFn: (data: FilialeFormData) => filialeService.createFiliale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filialen'] });
      toast.success('Filiale erfolgreich erstellt');
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Fehler beim Erstellen der Filiale: ' + (error.response?.data?.message || error.message));
    }
  });

  // Update filiale mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FilialeFormData }) => 
      filialeService.updateFiliale(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filialen'] });
      toast.success('Filiale erfolgreich aktualisiert');
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Fehler beim Aktualisieren der Filiale: ' + (error.response?.data?.message || error.message));
    }
  });

  // Delete filiale mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => filialeService.deleteFiliale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filialen'] });
      toast.success('Filiale erfolgreich gelöscht');
    },
    onError: (error: any) => {
      toast.error('Fehler beim Löschen der Filiale: ' + (error.response?.data?.message || error.message));
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      postal_code: '',
      phone: '',
      email: '',
      manager_id: '',
      status: 'active'
    });
    setActiveFiliale(null);
  };

  const handleAddFiliale = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating filiale with data:', formData);
    createMutation.mutate(formData);
  };

  const handleUpdateFiliale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFiliale) return;
    console.log('Updating filiale with data:', formData, 'ID:', activeFiliale.id);
    updateMutation.mutate({ id: activeFiliale.id, data: formData });
  };

  const handleEdit = (filiale: any) => {
    console.log('Editing filiale:', filiale);
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

  const handleDelete = (filiale: any) => {
    if (window.confirm(`Möchten Sie die Filiale "${filiale.name}" wirklich löschen?`)) {
      console.log('Deleting filiale:', filiale.id);
      deleteMutation.mutate(filiale.id);
    }
  };

  const isLoading = filialenLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

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
