
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { VerticalDotsIcon } from '@/components/icons/VerticalDotsIcon';
import { CSVIcon } from '@/components/icons/CSVIcon';
import { ExcelIcon } from '@/components/icons/ExcelIcon';
import { PDFIcon } from '@/components/icons/PDFIcon';
import { exportToCSV, exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface CustomerFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onCreateNew: () => void;
  customers: any[];
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchValue,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onCreateNew,
  customers
}) => {
  const statusOptions = [
    { label: "Alle", value: "" },
    { label: "Hoch", value: "high" },
    { label: "Mittel", value: "medium" },
    { label: "Niedrig", value: "low" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Suche nach Name, Firma oder Email..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateNew}>
          <PlusIcon />
          Neuen Kunden hinzufügen
        </Button>
      </div>
      <div className="flex justify-between items-center">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtern nach Priorität" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <VerticalDotsIcon />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportToCSV(customers, 'customers')}>
              <CSVIcon size={16} className="mr-2" />
              CSV Export
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToExcel(customers, 'customers')}>
              <ExcelIcon size={16} className="mr-2" />
              Excel Export
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToPdf(customers, 'Kundenliste', 'customers')}>
              <PDFIcon size={16} className="mr-2" />
              PDF Export
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
