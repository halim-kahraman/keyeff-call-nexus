
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
  const { data: filialen } = useQuery({
    queryKey: ['filialen'],
    queryFn: filialeService.getFilialen,
    enabled: isAdmin,
  });

  // Fetch statistics
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['statistics', effectiveFiliale, dateRange],
    queryFn: () => statisticsService.getStatistics(effectiveFiliale, dateRange),
  });

  // Mock data for charts
  const mockBarChartData = [
    { name: 'KW22', Anrufe: 4000, Kampagnen: 2400 },
    { name: 'KW23', Anrufe: 3000, Kampagnen: 1398 },
    { name: 'KW24', Anrufe: 2000, Kampagnen: 9800 },
    { name: 'KW25', Anrufe: 2780, Kampagnen: 3908 },
    { name: 'KW26', Anrufe: 1890, Kampagnen: 4800 },
    { name: 'KW27', Anrufe: 2390, Kampagnen: 3800 },
    { name: 'KW28', Anrufe: 3490, Kampagnen: 4300 },
  ];

  const mockLineChartData = [
    { name: 'KW22', Besuche: 4000 },
    { name: 'KW23', Besuche: 3000 },
    { name: 'KW24', Besuche: 2000 },
    { name: 'KW25', Besuche: 2780 },
    { name: 'KW26', Besuche: 1890 },
    { name: 'KW27', Besuche: 2390 },
    { name: 'KW28', Besuche: 3490 },
  ];

  const mockPieChartData = [
    { name: 'Erfolgreich', value: 400 },
    { name: 'Nicht Erfolgreich', value: 300 },
    { name: 'Ausstehend', value: 300 },
    { name: 'Pausiert', value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Chart configurations
  const barChartConfig = {
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
  };

  const lineChartConfig = {
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
  };

  const pieChartConfig = {
    innerRadius: 60,
    outerRadius: 80,
    fill: '#8884d8',
    paddingAngle: 5,
    dataKey: 'value',
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
    const exportData = stats ? [stats] : [];
    exportToPdf(exportData, "statistiken", "Statistiken");
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

          <Select onValueChange={handleDateRangeChange}>
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
            <Button onClick={handleExport}>
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
                <TrendingUp className="h-4 w-4" />
                <span>Gesamtumsatz</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45.000 €</div>
              <div className="text-sm text-muted-foreground">
                +12% im Vergleich zum Vormonat
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Anrufe</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.250</div>
              <div className="text-sm text-muted-foreground">
                +8% im Vergleich zum Vormonat
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Leads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">320</div>
              <div className="text-sm text-muted-foreground">
                +5% im Vergleich zum Vormonat
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Anrufe vs. Kampagnen</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockBarChartData} {...barChartConfig}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Anrufe" fill="#8884d8" />
                  <Bar dataKey="Kampagnen" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Besuche</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockLineChartData} {...lineChartConfig}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="Besuche" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kampagnen Ergebnisse</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  {...pieChartConfig}
                  data={mockPieChartData}
                  labelLine={false}
                  label
                >
                  {mockPieChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Statistics;
