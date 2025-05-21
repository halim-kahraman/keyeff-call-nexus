
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Statistics = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [filterUser, setFilterUser] = useState("all");
  
  // Mock data for call statistics
  const callData = [
    { day: "Mo", calls: 15, answered: 12, duration: 120 },
    { day: "Di", calls: 20, answered: 18, duration: 180 },
    { day: "Mi", calls: 25, answered: 22, duration: 220 },
    { day: "Do", calls: 18, answered: 16, duration: 160 },
    { day: "Fr", calls: 22, answered: 20, duration: 200 },
    { day: "Sa", calls: 10, answered: 8, duration: 80 },
    { day: "So", calls: 5, answered: 4, duration: 40 },
  ];
  
  // Mock data for appointment statistics
  const appointmentData = [
    { month: "Jan", appointments: 45, completed: 40 },
    { month: "Feb", appointments: 52, completed: 48 },
    { month: "Mär", appointments: 48, completed: 42 },
    { month: "Apr", appointments: 60, completed: 54 },
    { month: "Mai", appointments: 55, completed: 50 },
    { month: "Jun", appointments: 70, completed: 65 },
    { month: "Jul", appointments: 68, completed: 62 },
    { month: "Aug", appointments: 60, completed: 55 },
    { month: "Sep", appointments: 65, completed: 60 },
    { month: "Okt", appointments: 70, completed: 65 },
    { month: "Nov", appointments: 75, completed: 68 },
    { month: "Dez", appointments: 80, completed: 72 },
  ];
  
  // Mock data for call outcomes
  const callOutcomeData = [
    { name: "Termin vereinbart", value: 35, color: "#4CAF50" },
    { name: "Rückruf gewünscht", value: 20, color: "#2196F3" },
    { name: "Kein Interesse", value: 30, color: "#FFC107" },
    { name: "Nicht erreicht", value: 15, color: "#F44336" },
  ];
  
  // Mock data for telefonist performance
  const userPerformanceData = [
    { name: "Anna M.", calls: 120, appointments: 45, contracts: 20 },
    { name: "Max S.", calls: 150, appointments: 60, contracts: 25 },
    { name: "Julia K.", calls: 100, appointments: 35, contracts: 15 },
    { name: "Thomas B.", calls: 130, appointments: 50, contracts: 22 },
  ];

  return (
    <AppLayout title="Statistiken" subtitle="Performance und Anrufstatistiken">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zeitraum wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Heute</SelectItem>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
              <SelectItem value="quarter">Dieses Quartal</SelectItem>
              <SelectItem value="year">Dieses Jahr</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Benutzer wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Benutzer</SelectItem>
              <SelectItem value="user1">Anna M.</SelectItem>
              <SelectItem value="user2">Max S.</SelectItem>
              <SelectItem value="user3">Julia K.</SelectItem>
              <SelectItem value="user4">Thomas B.</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="py-4">
            <CardDescription>Gesamt Anrufe</CardDescription>
            <CardTitle className="text-3xl">115</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardDescription>Erfolgreiche Anrufe</CardDescription>
            <CardTitle className="text-3xl">98 <span className="text-sm text-muted-foreground">(85%)</span></CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardDescription>Durchschn. Gesprächsdauer</CardDescription>
            <CardTitle className="text-3xl">8:42 Min</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardDescription>Vereinbarte Termine</CardDescription>
            <CardTitle className="text-3xl">42</CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      <Tabs defaultValue="calls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calls">Anrufstatistiken</TabsTrigger>
          <TabsTrigger value="appointments">Terminstatistiken</TabsTrigger>
          <TabsTrigger value="users">Benutzerleistung</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Anrufe pro Tag</CardTitle>
                <CardDescription>Vergleich zwischen getätigten und angenommenen Anrufen</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={callData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calls" name="Getätigte Anrufe" fill="#8884d8" />
                    <Bar dataKey="answered" name="Angenommene Anrufe" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Anrufergebnisse</CardTitle>
                <CardDescription>Verteilung der Gesprächsergebnisse</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={callOutcomeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {callOutcomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Durchschnittliche Gesprächsdauer</CardTitle>
              <CardDescription>Angegeben in Minuten</CardDescription>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={callData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="duration" name="Dauer (Min.)" fill="#1EAEDB" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Termine pro Monat</CardTitle>
              <CardDescription>Vergleich zwischen vereinbarten und durchgeführten Terminen</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={appointmentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appointments" name="Vereinbarte Termine" fill="#4CAF50" />
                  <Bar dataKey="completed" name="Durchgeführte Termine" fill="#81D4FA" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Telefonisten Performance</CardTitle>
              <CardDescription>Leistungsvergleich zwischen Benutzern</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userPerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calls" name="Anrufe" fill="#8884d8" />
                  <Bar dataKey="appointments" name="Termine" fill="#82ca9d" />
                  <Bar dataKey="contracts" name="Verträge" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Statistics;
