
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload } from 'lucide-react';

interface CustomerActionsProps {
  customersCount: number;
  onImport: () => void;
  onCreateNew: () => void;
}

export const CustomerActions: React.FC<CustomerActionsProps> = ({
  customersCount,
  onImport,
  onCreateNew
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-600">
        {customersCount > 0 ? `${customersCount} Kunden gefunden` : 'Keine Kunden vorhanden'}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onImport}
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          Import
        </Button>
        <Button
          onClick={onCreateNew}
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Neuer Kunde
        </Button>
      </div>
    </div>
  );
};
