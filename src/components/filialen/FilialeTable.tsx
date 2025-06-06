
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface FilialeTableProps {
  filialen: any[];
  isLoading: boolean;
  onEdit: (filiale: any) => void;
  onDelete: (filialeId: string) => void;
}

export const FilialeTable: React.FC<FilialeTableProps> = ({
  filialen,
  isLoading,
  onEdit,
  onDelete
}) => {
  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Stadt</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Erstellt am</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">Lade Filialen...</TableCell>
            </TableRow>
          ) : filialen.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">Keine Filialen vorhanden</TableCell>
            </TableRow>
          ) : (
            filialen.map((filiale: any) => (
              <TableRow key={filiale.id}>
                <TableCell>{filiale.id}</TableCell>
                <TableCell className="font-medium">{filiale.name}</TableCell>
                <TableCell>{filiale.address}</TableCell>
                <TableCell>{filiale.city}</TableCell>
                <TableCell>{filiale.phone}</TableCell>
                <TableCell>{filiale.manager_name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${filiale.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {filiale.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </TableCell>
                <TableCell>{new Date(filiale.created_at).toLocaleDateString('de-DE')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(filiale)} title="Bearbeiten">
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(filiale.id)} title="Löschen">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
