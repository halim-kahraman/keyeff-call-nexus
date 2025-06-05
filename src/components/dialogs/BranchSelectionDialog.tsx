
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { filialeService } from '@/services/api';

interface BranchSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBranchSelected: (branchId: string) => void;
}

export const BranchSelectionDialog: React.FC<BranchSelectionDialogProps> = ({
  open,
  onOpenChange,
  onBranchSelected
}) => {
  const [selectedBranch, setSelectedBranch] = React.useState<string>('');

  const { data: filialen = [], isLoading } = useQuery({
    queryKey: ['filialen'],
    queryFn: async () => {
      const response = await filialeService.getFilialen();
      return response.data || [];
    },
    enabled: open,
  });

  const handleConfirm = () => {
    if (selectedBranch) {
      onBranchSelected(selectedBranch);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white z-50">
        <DialogHeader>
          <DialogTitle>Filiale auswählen</DialogTitle>
          <DialogDescription>
            Bitte wählen Sie eine Filiale aus, um fortzufahren.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Filiale auswählen" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              {isLoading ? (
                <SelectItem value="loading" disabled>Lädt...</SelectItem>
              ) : filialen.length === 0 ? (
                <SelectItem value="empty" disabled>Keine Filialen verfügbar</SelectItem>
              ) : (
                filialen.map((filiale: any) => (
                  <SelectItem key={filiale.id} value={filiale.id.toString()}>
                    {filiale.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleConfirm} 
            className="w-full" 
            disabled={!selectedBranch || isLoading}
          >
            Bestätigen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
