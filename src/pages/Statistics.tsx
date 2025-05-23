
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format, sub } from "date-fns";
import { de } from "date-fns/locale";
import { statisticsService } from "@/services/api";

// Types for statistics data
interface StatisticsData {
  summary: {
    total_calls: number;
    total_appointments: number;
    total_customers_contacted: number;
    period: {
      start: string;
      end: string;
    };
  };
  calls_by_day: {
    day: string;
    total_calls: number;
    total_duration: number;
    avg_duration: number;
  }[];
  calls_by_outcome: {
    outcome: string;
    count: number;
  }[];
  top_callers: {
    id: string;
    name: string;
    total_calls: number;
    total_duration: number;
    avg_duration: number;
  }[];
  appointments_by_type: {
    type: string;
    count: number;
  }[];
  filiale_stats?: {
    id: string;
    name: string;
    total_users: number;
    total_calls: number;
    total_appointments: number;
    total_call_duration: number;
    avg_call_duration: number;
  }[];
}

const Statistics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("week");
  const [filterUser, setFilterUser] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: format(sub(new Date(), { days: 7 }), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  
  // Update date range based on time range selection
  useEffect(() => {
    const now = new Date();
    let start = new Date();
    
    switch (timeRange) {
      case "day":
        start = sub(now, { days: 1 });
        break;
      case "week":
        start = sub(now, { days: 7 });
        break;
      case "month":
        start = sub(now, { months: 1 });
        break;
      case "quarter":
        start = sub(now, { months: 3 });
        break;
      case "year":
        start = sub(now, { years: 1 });
        break;
      default:
        start = sub(now, { days: 7 });
    }
    
    setDateRange({
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(now, "yyyy-MM-dd"),
    });
  }, [timeRange]);
  
  // Fetch statistics from API
  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['statistics', dateRange.startDate, dateRange.endDate, filterUser],
    queryFn: async () => {
      return await statisticsService.getStatistics(
        dateRange.startDate, 
        dateRange.endDate, 
        filterUser !== "all" ? filterUser : undefined
      );
    }
  });
  
  // Extract statsData from response
  const statsData = statsResponse?.data;
  
  // Update filter user when changed
  const handleUserChange = (userId: string) => {
    setFilterUser(userId);
  };

  // Generate colors for charts
  const generateColors = (count: number) => {
    const colors = [
      "#4CAF50", "#2196F3", "#FFC107", "#F44336", "#9C27B0", 
      "#FF9800", "#795548", "#607D8B", "#3F51B5", "#009688"
    ];
    
    return Array(count).fill(0).map((_, i) => colors[i % colors.length]);
  };
  
  // Format duration from seconds to minutes and seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format outcome labels
  const formatOutcome = (outcome: string) => {
    const outcomeMap: Record<string, string> = {
      "interested": "Interessiert",
      "callback": "Rückruf",
      "no_answer": "Nicht erreicht",
      "not_interested": "Kein Interesse",
      "appointment": "Termin"
    };
    
    return outcomeMap[outcome] || outcome;
  };

  // Handle PDF export
  const exportToPDF = () => {
    toast({
      title: "Export gestartet",
      description: "Die Statistiken werden als PDF exportiert...",
    });
    
    // In a real implementation, this would use a library like jsPDF or call a backend API
    setTimeout(() => {
      toast({
        title: "Export erfolgreich",
        description: "Die Statistiken wurden erfolgreich als PDF exportiert.",
      });
    }, 2000);
  };
  
  // Handle email sending
  const sendReportEmail = () => {
    toast({
      title: "Report wird versendet",
      description: "Die Statistiken werden per E-Mail versendet...",
    });
    
    // In a real implementation, this would call a backend API
    setTimeout(() => {
      toast({
        title: "E-Mail gesendet",
        description: "Die Statistiken wurden erfolgreich per E-Mail versendet.",
      });
    }, 2000);
  };

  // Prepare call outcome data for pie chart
  const prepareCallOutcomeData = () => {
    if (!statsData?.calls_by_outcome) return [];
    
    return statsData.calls_by_outcome.map(item => ({
      name: formatOutcome(item.outcome),
      value: item.count,
      color: item.outcome === "interested" ? "#4CAF50" : 
             item.outcome === "callback" ? "#2196F3" :
             item.outcome === "appointment" ? "#8884d8" :
             item.outcome === "not_interested" ? "#FFC107" : "#F44336"
    }));
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd.MM.yy", { locale: de });
  };
  
  // Prepare call data by day
  const prepareCallsByDay = () => {
    if (!statsData?.calls_by_day) return [];
    
    return statsData.calls_by_day.map(item => ({
      ...item,
      day: formatDate(item.day)
    }));
  };

  return (
    <AppLayout title="Statistiken" subtitle="Performance und Anrufstatistiken">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center flex-wrap gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zeitraum wählen" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="day">Heute</SelectItem>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
              <SelectItem value="quarter">Dieses Quartal</SelectItem>
              <SelectItem value="year">Dieses Jahr</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterUser} onValueChange={handleUserChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mitarbeiter wählen" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">Alle Mitarbeiter</SelectItem>
              {statsData?.top_callers?.map(caller => (
                <SelectItem key={caller.id} value={caller.id}>{caller.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="text-sm text-muted-foreground">
            {dateRange.startDate} bis {dateRange.endDate}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF Export
          </Button>
          <Button variant="outline" size="sm" onClick={sendReportEmail}>
            <FileText className="mr-2 h-4 w-4" />
            Per E-Mail senden
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="py-4">
            <CardDescription>Gesamt Anrufe</CardDescription>
            <CardTitle className="text-3xl">{statsData?.summary?.total_calls || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardDescription>Kontaktierte Kunden</CardDescription>
            <CardTitle className="text-3xl">{statsData?.summary?.total_customers_contacted || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardDescription>Durchschn. Gesprächsdauer</CardDescription>
            <CardTitle className="text-3xl">
              {statsData?.calls_by_day && statsData.calls_by_day.length > 0 
                ? formatDuration(statsData.calls_by_day.reduce((acc, day) => acc + day.avg_duration, 0) / statsData.calls_by_day.length)
                : "0:00"} Min
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardDescription>Vereinbarte Termine</CardDescription>
            <CardTitle className="text-3xl">{statsData?.summary?.total_appointments || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      <Tabs defaultValue="calls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calls">Anrufstatistiken</TabsTrigger>
          <TabsTrigger value="appointments">Terminstatistiken</TabsTrigger>
          <TabsTrigger value="users">Telefonisten Performance</TabsTrigger>
          {(user?.role === "admin" || user?.role === "filialleiter") && filterUser === "all" && (
            <TabsTrigger value="filialen">Filialstatistiken</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="calls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Anrufe pro Tag</CardTitle>
                <CardDescription>
                  {filterUser !== "all" 
                    ? "Anrufe des ausgewählten Mitarbeiters"
                    : "Vergleich zwischen getätigten Anrufen"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {statsData?.calls_by_day && statsData.calls_by_day.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareCallsByDay()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total_calls" name="Getätigte Anrufe" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Keine Daten verfügbar</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Anrufergebnisse</CardTitle>
                <CardDescription>Verteilung der Gesprächsergebnisse</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {statsData?.calls_by_outcome && statsData.calls_by_outcome.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareCallOutcomeData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {prepareCallOutcomeData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Keine Daten verfügbar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Durchschnittliche Gesprächsdauer</CardTitle>
              <CardDescription>Angegeben in Minuten</CardDescription>
            </CardHeader>
            <CardContent className="h-60">
              {statsData?.calls_by_day && statsData.calls_by_day.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareCallsByDay()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg_duration" name="Ø Dauer (Sek.)" fill="#1EAEDB" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Keine Daten verfügbar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Termine nach Typ</CardTitle>
              <CardDescription>Verteilung der vereinbarten Termine</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {statsData?.appointments_by_type && statsData.appointments_by_type.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statsData.appointments_by_type}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Anzahl Termine" fill="#4CAF50">
                      {statsData.appointments_by_type.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={generateColors(statsData.appointments_by_type.length)[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Keine Terminstatistiken verfügbar</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Termine pro Mitarbeiter</CardTitle>
              <CardDescription>Verteilung der Termine nach Mitarbeiter</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {statsData?.top_callers && statsData.top_callers.some(caller => caller.total_calls > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statsData.top_callers.filter(caller => caller.total_calls > 0)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_calls" name="Anrufe" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Keine Terminstatistiken verfügbar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Telefonisten Performance</CardTitle>
              <CardDescription>Leistungsvergleich zwischen Mitarbeitern</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {statsData?.top_callers && statsData.top_callers.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statsData.top_callers}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_calls" name="Anrufe" fill="#8884d8" />
                    <Bar dataKey="avg_duration" name="Ø Dauer (Sek.)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Keine Mitarbeiterstatistiken verfügbar</p>
                </div>
              )}
            </CardContent>
          </Card>

          {filterUser !== "all" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Individuelle Performance</CardTitle>
                  <CardDescription>
                    Details zur individuellen Leistung
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  // Send individual report via email
                  toast({
                    title: "Report wird generiert",
                    description: "Der individuelle Leistungsbericht wird erstellt...",
                  });
                  
                  setTimeout(() => {
                    toast({
                      title: "Report versendet",
                      description: "Der Leistungsbericht wurde erfolgreich per E-Mail versendet.",
                    });
                  }, 2000);
                }}>
                  <FileText className="mr-2 h-4 w-4" />
                  An Mitarbeiter senden
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background border rounded-md p-4">
                      <div className="text-muted-foreground text-sm">Erfolgsquote</div>
                      <div className="text-2xl font-bold mt-1">
                        {statsData?.calls_by_outcome && statsData.calls_by_outcome.length > 0
                          ? `${Math.round((statsData.calls_by_outcome.find(o => o.outcome === "interested" || o.outcome === "appointment")?.count || 0) / 
                             statsData.calls_by_outcome.reduce((sum, item) => sum + item.count, 0) * 100)}%`
                          : "0%"}
                      </div>
                    </div>
                    <div className="bg-background border rounded-md p-4">
                      <div className="text-muted-foreground text-sm">Anrufe pro Tag</div>
                      <div className="text-2xl font-bold mt-1">
                        {statsData?.calls_by_day && statsData.calls_by_day.length > 0
                          ? (statsData.summary.total_calls / statsData.calls_by_day.length).toFixed(1)
                          : "0"}
                      </div>
                    </div>
                    <div className="bg-background border rounded-md p-4">
                      <div className="text-muted-foreground text-sm">Termine pro Anruf</div>
                      <div className="text-2xl font-bold mt-1">
                        {statsData?.summary && statsData.summary.total_calls > 0
                          ? (statsData.summary.total_appointments / statsData.summary.total_calls).toFixed(2)
                          : "0"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {(user?.role === "admin" || user?.role === "filialleiter") && filterUser === "all" && (
          <TabsContent value="filialen" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filialstatistiken</CardTitle>
                <CardDescription>Leistungsvergleich zwischen Filialen</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {statsData?.filiale_stats && statsData.filiale_stats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statsData.filiale_stats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total_calls" name="Anrufe" fill="#8884d8" />
                      <Bar dataKey="total_appointments" name="Termine" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Keine Filialstatistiken verfügbar</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Filiale Detailübersicht</CardTitle>
                <CardDescription>Detaillierte Kennzahlen je Filiale</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Filiale</th>
                        <th className="text-center p-2">Mitarbeiter</th>
                        <th className="text-center p-2">Anrufe</th>
                        <th className="text-center p-2">Termine</th>
                        <th className="text-center p-2">Erfolgsrate</th>
                        <th className="text-center p-2">Ø Gesprächsdauer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData?.filiale_stats?.map(filiale => (
                        <tr key={filiale.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{filiale.name}</td>
                          <td className="text-center p-2">{filiale.total_users}</td>
                          <td className="text-center p-2">{filiale.total_calls}</td>
                          <td className="text-center p-2">{filiale.total_appointments}</td>
                          <td className="text-center p-2">
                            {filiale.total_calls > 0 
                              ? `${Math.round((filiale.total_appointments / filiale.total_calls) * 100)}%` 
                              : '0%'}
                          </td>
                          <td className="text-center p-2">
                            {formatDuration(filiale.avg_call_duration)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </AppLayout>
  );
};

export default Statistics;
