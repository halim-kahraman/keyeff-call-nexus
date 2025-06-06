
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, PlusCircle, Upload } from 'lucide-react';

interface CustomerEmptyStateProps {
  searchValue: string;
  selectedStatus: string;
  onCreateNew: () => void;
  onImport: () => void;
}

export const CustomerEmptyState: React.FC<CustomerEmptyStateProps> = ({
  searchValue,
  selectedStatus,
  onCreateNew,
  onImport
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-12 text-center">
          <div className="space-y-4">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-700">Keine Kunden gefunden</h3>
            <p className="text-sm text-gray-600 max-w-md">
              {searchValue || selectedStatus
                ? 'Keine Kunden entsprechen den aktuellen Filterkriterien.'
                : 'Es wurden noch keine Kunden angelegt. Erstellen Sie Ihren ersten Kunden oder importieren Sie bestehende Daten.'}
            </p>
            <div className="flex justify-center gap-2">
              <Button 
                onClick={onCreateNew}
                className="flex items-center gap-2"
              >
                <PlusCircle size={16} />
                Ersten Kunden erstellen
              </Button>
              <Button 
                variant="outline"
                onClick={onImport}
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                Kunden importieren
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
