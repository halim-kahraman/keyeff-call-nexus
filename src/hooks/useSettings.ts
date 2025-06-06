
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { settingsService, filialeService } from '@/services/api';

export const useSettings = () => {
  const { user } = useAuth();
  const [selectedFiliale, setSelectedFiliale] = useState<string>('global');
  const [confirmedFiliale, setConfirmedFiliale] = useState<string>('global');
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Fetch filialen for admin users
  const { data: filialen = [] } = useQuery({
    queryKey: ['filialen'],
    queryFn: async () => {
      if (!isAdmin) return [];
      const response = await filialeService.getFilialen();
      return response.data || [];
    },
    enabled: isAdmin,
  });

  // Set default filiale for non-admin users
  useEffect(() => {
    if (!isAdmin && user?.filiale_id) {
      const filialeId = user.filiale_id.toString();
      setSelectedFiliale(filialeId);
      setConfirmedFiliale(filialeId);
    }
  }, [isAdmin, user]);

  // Fetch settings for the confirmed category and filiale
  const fetchSettings = async (category: string) => {
    try {
      setIsLoading(true);
      const filialeId = confirmedFiliale === 'global' ? null : confirmedFiliale;
      const response = await settingsService.getSettings(category, filialeId);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm filiale selection and load settings
  const handleConfirmFiliale = async () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('Sie haben ungespeicherte Änderungen. Möchten Sie die Filiale wirklich wechseln?');
      if (!confirmed) return;
    }
    
    setConfirmedFiliale(selectedFiliale);
    setHasUnsavedChanges(false);
    toast.success(`Filiale gewechselt zu: ${selectedFiliale === 'global' ? 'Global' : filialen.find((f: any) => f.id.toString() === selectedFiliale)?.name || selectedFiliale}`);
  };

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async ({ category, data }: { category: string; data: any }) => {
      const filialeId = confirmedFiliale === 'global' ? null : confirmedFiliale;
      return settingsService.saveSettings({ category, ...data }, filialeId);
    },
    onSuccess: () => {
      toast.success('Einstellungen erfolgreich gespeichert');
      setHasUnsavedChanges(false);
    },
    onError: () => {
      toast.error('Fehler beim Speichern der Einstellungen');
    }
  });

  // Test connection mutations
  const testSipMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testSipConnection({ settings }),
    onSuccess: (response) => {
      toast.success(response.message || 'SIP-Verbindung erfolgreich getestet');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'SIP-Verbindung fehlgeschlagen');
    }
  });

  const testVpnMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testVpnConnection({ settings }),
    onSuccess: (response) => {
      toast.success(response.message || 'VPN-Verbindung erfolgreich getestet');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'VPN-Verbindung fehlgeschlagen');
    }
  });

  const testFritzboxMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testFritzboxConnection({ settings }),
    onSuccess: (response) => {
      toast.success(response.message || 'Fritz!Box-Verbindung erfolgreich getestet');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Fritz!Box-Verbindung fehlgeschlagen');
    }
  });

  const testEmailMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testEmailConnection({ settings }),
    onSuccess: (response) => {
      toast.success(response.message || 'E-Mail-Verbindung erfolgreich getestet');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'E-Mail-Verbindung fehlgeschlagen');
    }
  });

  const testKeyEffApiMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testKeyEffApiConnection({ settings }),
    onSuccess: (response) => {
      toast.success(response.message || 'KeyEff API-Verbindung erfolgreich getestet');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'KeyEff API-Verbindung fehlgeschlagen');
    }
  });

  const handleSaveSettings = (category: string) => {
    saveSettingsMutation.mutate({ category, data: settings });
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Load settings when category or confirmed filiale changes
  const loadCategorySettings = async (category: string) => {
    const categorySettings = await fetchSettings(category);
    setSettings(categorySettings);
    setHasUnsavedChanges(false);
  };

  return {
    isAdmin,
    filialen,
    selectedFiliale,
    setSelectedFiliale,
    confirmedFiliale,
    settings,
    isLoading,
    hasUnsavedChanges,
    handleConfirmFiliale,
    handleSaveSettings,
    handleSettingChange,
    loadCategorySettings,
    testSipMutation,
    testVpnMutation,
    testFritzboxMutation,
    testEmailMutation,
    testKeyEffApiMutation
  };
};
