
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Download, RefreshCw, TrendingUp, Phone, Users, Calendar } from "lucide-react";
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
      exportToPdf([stats], "statistiken", "Statistiken");
    }
  };

  return (
    <AppLayout title="Statistiken" subtitle="Übersicht über Anrufe und Kampagnen-Performance">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          {isAdmin && (
            <Select onValueChange={handleFilialeChange}>
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

          <Select onValueChange={handleDateRangeChange} defaultValue="30">
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
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Aktualisieren
            </Button>
            <Button onClick={handleExport} disabled={!stats}>
              <Download className="mr-2 h-4 w-4" />
              Exportieren
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div id="statistics-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Charts */}
        {!isLoading && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Anrufe pro Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.calls_by_day}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_calls" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anruf-Ergebnisse</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.calls_by_outcome}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {chartData.calls_by_outcome.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Callers */}
        {!isLoading && stats && chartData.top_callers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Anrufer</CardTitle>
            </CardHeader>
            <CardContent>
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
        {!isLoading && (!stats || (!stats.summary?.total_calls && !stats.summary?.total_appointments)) && (
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
