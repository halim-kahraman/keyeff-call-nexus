
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { filialeService } from "@/services/api";
import { toast } from "sonner";

interface BranchSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetPath: string;
}

export const BranchSelectionDialog: React.FC<BranchSelectionDialogProps> = ({
  isOpen,
  onOpenChange,
  targetPath,
}) => {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  // Fetch branches
  const { data: filialen = [], isLoading } = useQuery({
    queryKey: ['filialen'],
    queryFn: filialeService.getFilialen,
  });

  const handleContinue = () => {
    if (!selectedBranch) {
      toast.error("Bitte wählen Sie eine Filiale aus");
      return;
    }

    // Add the selected branch as a query parameter and navigate
    const url = new URL(targetPath, window.location.origin);
    url.searchParams.set('filiale', selectedBranch);
    navigate(url.pathname + url.search);
    onOpenChange(false);
  };

  const handleCancel = () => {
    navigate('/');
    onOpenChange(false);
  };

  // If we're testing in preview mode and have no data, use mock data
  const mockFilialen = [
    { id: "1", name: "Zentrale", address: "Hauptstr. 1, 10115 Berlin" },
    { id: "2", name: "Berlin", address: "Berliner Str. 15, 10115 Berlin" },
    { id: "3", name: "München", address: "Münchner Str. 25, 80333 München" },
    { id: "4", name: "Hamburg", address: "Hamburger Str. 35, 20095 Hamburg" },
  ];

  const branchesData = filialen.length ? filialen : mockFilialen;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filiale auswählen</DialogTitle>
          <DialogDescription>
            Bitte wählen Sie eine Filiale aus, um fortzufahren.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="filiale">Filiale</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger id="filiale" className="w-full">
                  <SelectValue placeholder="Filiale auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Laden...</SelectItem>
                  ) : (
                    branchesData.map((filiale) => (
                      <SelectItem key={filiale.id} value={filiale.id}>
                        {filiale.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Abbrechen</Button>
          <Button onClick={handleContinue} disabled={!selectedBranch}>Fortfahren</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
