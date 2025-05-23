
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export interface BranchSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBranchSelected: (branchId: string) => void;
}

export function BranchSelectionDialog({ 
  open, 
  onOpenChange,
  onBranchSelected 
}: BranchSelectionDialogProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const { toast } = useToast();

  const handleConfirm = () => {
    if (!selectedBranch) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Filiale aus.",
        variant: "destructive",
      });
      return;
    }

    onBranchSelected(selectedBranch);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filiale auswählen</DialogTitle>
          <DialogDescription>
            Bitte wählen Sie eine Filiale aus, um fortzufahren.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filiale auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Berlin</SelectItem>
              <SelectItem value="2">München</SelectItem>
              <SelectItem value="3">Hamburg</SelectItem>
              <SelectItem value="4">Köln</SelectItem>
              <SelectItem value="5">Frankfurt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button onClick={handleConfirm} className="bg-keyeff-500 hover:bg-keyeff-600">
            Bestätigen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
