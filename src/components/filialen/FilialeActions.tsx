
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface FilialeActionsProps {
  filialeCount: number;
  onAddFiliale: () => void;
}

export const FilialeActions: React.FC<FilialeActionsProps> = ({
  filialeCount,
  onAddFiliale
}) => {
  return (
    <div className="admin-controls flex justify-between items-center">
      <div>
        <span className="text-sm font-medium">Filialen gesamt: {filialeCount}</span>
      </div>
      <Button 
        className="flex items-center gap-2"
        onClick={onAddFiliale}
      >
        <PlusCircle size={16} />
        <span>Neue Filiale</span>
      </Button>
    </div>
  );
};
