
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface BranchSelectorProps {
  isAdmin: boolean;
  filialen: any[];
  selectedFiliale: string;
  confirmedFiliale: string;
  hasUnsavedChanges: boolean;
  onSelectedFilialeChange: (value: string) => void;
  onConfirmFiliale: () => void;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  isAdmin,
  filialen,
  selectedFiliale,
  confirmedFiliale,
  hasUnsavedChanges,
  onSelectedFilialeChange,
  onConfirmFiliale
}) => {
  if (!isAdmin) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filiale auswählen</CardTitle>
        <CardDescription>
          Wählen Sie eine Filiale aus oder verwalten Sie globale Einstellungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Select value={selectedFiliale} onValueChange={onSelectedFilialeChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filiale auswählen" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="global">Globale Einstellungen</SelectItem>
              {filialen.map((filiale: any) => (
                <SelectItem key={filiale.id} value={filiale.id.toString()}>
                  {filiale.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={onConfirmFiliale}
            disabled={selectedFiliale === confirmedFiliale}
            variant={selectedFiliale !== confirmedFiliale ? "default" : "outline"}
          >
            {selectedFiliale !== confirmedFiliale ? "Filiale bestätigen" : "Aktiv"}
          </Button>
        </div>
        {selectedFiliale !== confirmedFiliale && (
          <p className="text-sm text-amber-600 mt-2">
            Klicken Sie "Filiale bestätigen" um die Einstellungen für diese Filiale zu laden.
          </p>
        )}
        {hasUnsavedChanges && (
          <p className="text-sm text-red-600 mt-2">
            Sie haben ungespeicherte Änderungen.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
