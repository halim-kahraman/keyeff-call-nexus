
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

const Logs = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [userFilter, setUserFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Mock logs data
  const logs = [
    { id: 1, timestamp: "2023-05-21 10:30:45", user: "admin@keyeff.de", type: "login", ip: "192.168.1.1", description: "Successful login" },
    { id: 2, timestamp: "2023-05-21 10:32:12", user: "telefonist1@keyeff.de", type: "call", ip: "192.168.1.2", description: "Call initiated to +49123456789" },
    { id: 3, timestamp: "2023-05-21 10:45:30", user: "telefonist1@keyeff.de", type: "call", ip: "192.168.1.2", description: "Call ended, duration: 00:13:18" },
    { id: 4, timestamp: "2023-05-21 11:05:22", user: "telefonist2@keyeff.de", type: "data", ip: "192.168.1.3", description: "Customer data accessed: ID #12345" },
    { id: 5, timestamp: "2023-05-21 11:15:45", user: "filialleiter@keyeff.de", type: "report", ip: "192.168.1.4", description: "Generated monthly report" },
    { id: 6, timestamp: "2023-05-21 12:30:10", user: "admin@keyeff.de", type: "settings", ip: "192.168.1.1", description: "Changed system settings" },
    { id: 7, timestamp: "2023-05-21 13:05:30", user: "telefonist1@keyeff.de", type: "calendar", ip: "192.168.1.2", description: "Added appointment for customer #54321" },
    { id: 8, timestamp: "2023-05-21 14:20:15", user: "telefonist2@keyeff.de", type: "call", ip: "192.168.1.3", description: "Call failed to +49987654321" },
  ];
  
  // Filter logs based on user selections
  const filteredLogs = logs.filter(log => {
    if (userFilter !== "all" && log.user !== userFilter) return false;
    if (typeFilter !== "all" && log.type !== typeFilter) return false;
    if (searchQuery && !log.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  // Function to export logs as CSV
  const exportLogsCSV = () => {
    const headers = ["ID", "Timestamp", "User", "Type", "IP", "Description"];
    const csvData = filteredLogs.map(log => [
      log.id,
      log.timestamp,
      log.user,
      log.type,
      log.ip,
      log.description
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `dsgvo_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout title="DSGVO-Logs" subtitle="Logs für Datenschutz und Compliance">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Log-Filter</CardTitle>
          <CardDescription>Filter und exportiere Logs nach verschiedenen Kriterien</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Benutzer</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Benutzer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Benutzer</SelectItem>
                  <SelectItem value="admin@keyeff.de">admin@keyeff.de</SelectItem>
                  <SelectItem value="telefonist1@keyeff.de">telefonist1@keyeff.de</SelectItem>
                  <SelectItem value="telefonist2@keyeff.de">telefonist2@keyeff.de</SelectItem>
                  <SelectItem value="filialleiter@keyeff.de">filialleiter@keyeff.de</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Art</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Arten" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Arten</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="call">Telefonanruf</SelectItem>
                  <SelectItem value="data">Datenzugriff</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="settings">Einstellungen</SelectItem>
                  <SelectItem value="calendar">Kalender</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Von</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: de }) : "Datum auswählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Bis</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: de }) : "Datum auswählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-grow">
              <Input 
                placeholder="Suche in Beschreibungen..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={exportLogsCSV} className="whitespace-nowrap">
              Als CSV exportieren
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Log-Einträge</CardTitle>
          <CardDescription>
            {filteredLogs.length} Einträge gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Zeitstempel</TableHead>
                <TableHead>Benutzer</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>IP-Adresse</TableHead>
                <TableHead className="w-[300px]">Beschreibung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      log.type === 'login' ? 'bg-blue-100 text-blue-800' :
                      log.type === 'call' ? 'bg-green-100 text-green-800' :
                      log.type === 'data' ? 'bg-amber-100 text-amber-800' :
                      log.type === 'report' ? 'bg-purple-100 text-purple-800' :
                      log.type === 'settings' ? 'bg-gray-100 text-gray-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {log.type}
                    </span>
                  </TableCell>
                  <TableCell>{log.ip}</TableCell>
                  <TableCell>{log.description}</TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Keine Logs gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Logs;
