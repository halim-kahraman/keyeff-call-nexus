
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Calendar, Users } from 'lucide-react';

interface StatisticsCardsProps {
  stats: any;
  isLoading: boolean;
  dateRange: string;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  stats,
  isLoading,
  dateRange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>Anrufe gesamt</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? 'Lädt...' : (stats?.summary?.total_calls || 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            {isLoading ? '' : `Zeitraum: ${dateRange} Tage`}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Termine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? 'Lädt...' : (stats?.summary?.total_appointments || 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            {isLoading ? '' : `Zeitraum: ${dateRange} Tage`}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Kontaktierte Kunden</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? 'Lädt...' : (stats?.summary?.total_customers_contacted || 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            {isLoading ? '' : `Zeitraum: ${dateRange} Tage`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
