
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, filialeService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Settings {
  [key: string]: any;
}

export const useSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedFiliale, setSelectedFiliale] = useState<string>('');
  const [confirmedFiliale, setConfirmedFiliale] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isAdmin = user?.role === 'admin';

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['settings', selectedBranch],
    queryFn: () => settingsService.getSettings(selectedBranch),
    enabled: !!selectedBranch
  });

  const { data: filialen = [] } = useQuery({
    queryKey: ['filialen'],
    queryFn: filialeService.getFilialen,
    enabled: isAdmin
  });

  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: (data: any) => settingsService.saveSettings(selectedBranch, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', selectedBranch] });
      toast.success('Einstellungen gespeichert');
      setHasUnsavedChanges(false);
    },
    onError: () => {
      toast.error('Fehler beim Speichern der Einstellungen');
    }
  });

  const testSipMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testSipConnection(settings),
    onSuccess: () => toast.success('SIP-Verbindung erfolgreich'),
    onError: () => toast.error('SIP-Verbindung fehlgeschlagen')
  });

  const testVpnMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testVpnConnection(settings),
    onSuccess: () => toast.success('VPN-Verbindung erfolgreich'),
    onError: () => toast.error('VPN-Verbindung fehlgeschlagen')
  });

  const testFritzboxMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testFritzboxConnection(settings),
    onSuccess: () => toast.success('Fritz!Box-Verbindung erfolgreich'),
    onError: () => toast.error('Fritz!Box-Verbindung fehlgeschlagen')
  });

  const testEmailMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testEmailConnection(settings),
    onSuccess: () => toast.success('E-Mail-Verbindung erfolgreich'),
    onError: () => toast.error('E-Mail-Verbindung fehlgeschlagen')
  });

  const testKeyEffApiMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testKeyEffApiConnection(settings),
    onSuccess: () => toast.success('KeyEff API-Verbindung erfolgreich'),
    onError: () => toast.error('KeyEff API-Verbindung fehlgeschlagen')
  });

  const handleConfirmFiliale = () => {
    setConfirmedFiliale(selectedFiliale);
  };

  const handleSaveSettings = (category: string) => {
    saveSettings({ category, settings });
  };

  const handleSettingChange = (key: string, value: any) => {
    setHasUnsavedChanges(true);
    // Handle setting change logic
  };

  const loadCategorySettings = (category: string) => {
    // Load settings for specific category
  };

  return {
    settings,
    isLoading,
    saveSettings,
    isSaving,
    selectedBranch,
    setSelectedBranch,
    isAdmin,
    filialen,
    selectedFiliale,
    setSelectedFiliale,
    confirmedFiliale,
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
