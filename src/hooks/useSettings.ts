import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Settings {
  [key: string]: any;
}

export const useSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['settings', selectedBranch],
    queryFn: () => settingsService.getSettings(selectedBranch),
    enabled: !!selectedBranch
  });

  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: (data: any) => settingsService.saveSettings(selectedBranch, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', selectedBranch] });
      toast.success('Einstellungen gespeichert');
    },
    onError: () => {
      toast.error('Fehler beim Speichern der Einstellungen');
    }
  });

  return {
    settings,
    isLoading,
    saveSettings,
    isSaving,
    selectedBranch,
    setSelectedBranch
  };
};
