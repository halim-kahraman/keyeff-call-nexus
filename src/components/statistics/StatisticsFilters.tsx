
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';

interface Filiale {
  id: string;
  name: string;
}

interface StatisticsFiltersProps {
  isAdmin: boolean;
  filialen: Filiale[];
  selectedFiliale: string | null;
  onFilialeChange: (filialeId: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isLoading: boolean;
  hasStats: boolean;
}

export const StatisticsFilters: React.FC<StatisticsFiltersProps> = ({
  isAdmin,
  filialen,
  selectedFiliale,
  onFilialeChange,
  dateRange,
  onDateRangeChange,
  onRefresh,
  onExport,
  isLoading,
  hasStats
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
      {isAdmin && (
        <Select onValueChange={onFilialeChange}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="Filiale auswählen" />
          </SelectTrigger>
          <SelectContent>
            {filialen?.map((filiale: Filiale) => (
              <SelectItem key={filiale.id} value={filiale.id}>
                {filiale.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select onValueChange={onDateRangeChange} defaultValue="30">
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Zeitraum auswählen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Letzte 7 Tage</SelectItem>
          <SelectItem value="30">Letzte 30 Tage</SelectItem>
          <SelectItem value="90">Letzte 90 Tage</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex space-x-2">
        <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Aktualisieren
        </Button>
        <Button onClick={onExport} disabled={!hasStats}>
          <Download className="mr-2 h-4 w-4" />
          Exportieren
        </Button>
      </div>
    </div>
  );
};
