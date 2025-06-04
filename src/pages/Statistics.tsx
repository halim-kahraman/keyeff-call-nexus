
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatisticsCards } from "@/components/statistics/StatisticsCards";
import { StatisticsCharts } from "@/components/statistics/StatisticsCharts";
import { StatisticsFilters } from "@/components/statistics/StatisticsFilters";
import { TrendingUp } from "lucide-react";
import { statisticsService, filialeService } from "@/services/api";
import { exportToPdf } from "@/utils/exportUtils";

interface Filiale {
  id: string;
  name: string;
}

const Statistics = () => {
  const { user } = useAuth();
  const [selectedFiliale, setSelectedFiliale] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30");

  const isAdmin = user?.role === "admin";
  const effectiveFiliale = isAdmin ? selectedFiliale : user?.filiale;

  // Fetch filialen for admin users
  const { data: filialen = [] } = useQuery({
    queryKey: ['filialen'],
    queryFn: async () => {
      const response = await filialeService.getFilialen();
      return response.data || [];
    },
    enabled: isAdmin,
  });

  // Fetch statistics from API
  const { data: statsResponse, isLoading, refetch } = useQuery({
    queryKey: ['statistics', effectiveFiliale, dateRange],
    queryFn: () => statisticsService.getStatistics(effectiveFiliale, dateRange),
  });

  const stats = statsResponse?.data || null;

  // Prepare chart data from API response
  const chartData = {
    calls_by_day: stats?.calls_by_day || [],
    calls_by_outcome: stats?.calls_by_outcome || [],
    appointments_by_type: stats?.appointments_by_type || [],
    top_callers: stats?.top_callers || []
  };

  // Handlers
  const handleFilialeChange = (filialeId: string) => {
    setSelectedFiliale(filialeId);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    if (stats) {
      exportToPdf([stats], "Statistiken", "statistiken");
    }
  };

  const hasStats = stats && (stats.summary?.total_calls || stats.summary?.total_appointments);

  return (
    <AppLayout title="Statistiken" subtitle="Übersicht über Anrufe und Kampagnen-Performance">
      <div className="space-y-6">
        <StatisticsFilters
          isAdmin={isAdmin}
          filialen={filialen}
          selectedFiliale={selectedFiliale}
          onFilialeChange={handleFilialeChange}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isLoading={isLoading}
          hasStats={!!hasStats}
        />

        <StatisticsCards
          stats={stats}
          isLoading={isLoading}
          dateRange={dateRange}
        />

        {!isLoading && stats && (
          <StatisticsCharts
            chartData={chartData}
            isLoading={isLoading}
          />
        )}

        {/* Top Callers */}
        {!isLoading && stats && chartData.top_callers.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Anrufer</h3>
              <div className="space-y-2">
                {chartData.top_callers.map((caller: any, index: number) => (
                  <div key={caller.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{index + 1}. {caller.name}</span>
                    <div className="text-right">
                      <div className="font-bold">{caller.total_calls} Anrufe</div>
                      <div className="text-sm text-muted-foreground">
                        Ø {caller.avg_duration}s pro Anruf
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !hasStats && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Daten verfügbar</h3>
                <p>Für den ausgewählten Zeitraum sind noch keine Statistiken vorhanden.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Statistics;
