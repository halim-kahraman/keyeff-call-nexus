
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Download, Send } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { exportToExcel, exportToPdf, sendDataByEmail } from "@/utils/exportUtils";

// Mock data for logs
const mockLogs = [
  { id: 1, timestamp: "2023-05-21 10:30:45", user: { id: 1, name: "Administrator", email: "admin@keyeff.de" }, action: "login", details: "User logged in" },
  { id: 2, timestamp: "2023-05-21 10:32:12", user: { id: 2, name: "Telefonist 1", email: "telefonist1@keyeff.de" }, action: "view_customer", details: "Viewed customer #12345" },
  { id: 3, timestamp: "2023-05-21 10:45:30", user: { id: 2, name: "Telefonist 1", email: "telefonist1@keyeff.de" }, action: "call_log", details: "Logged call to customer #12345" },
  { id: 4, timestamp: "2023-05-21 11:05:22", user: { id: 3, name: "Telefonist 2", email: "telefonist2@keyeff.de" }, action: "update_customer", details: "Updated customer #54321" },
  { id: 5, timestamp: "2023-05-21 11:15:10", user: { id: 1, name: "Administrator", email: "admin@keyeff.de" }, action: "system_settings", details: "Updated system settings" },
  { id: 6, timestamp: "2023-05-21 12:00:05", user: { id: 4, name: "Filialleiter", email: "filialleiter@keyeff.de" }, action: "export_report", details: "Exported monthly report" },
  { id: 7, timestamp: "2023-05-21 12:35:30", user: { id: 2, name: "Telefonist 1", email: "telefonist1@keyeff.de" }, action: "logout", details: "User logged out" },
];

// Mock data for users
const mockUsers = [
  { id: 1, name: "Max Mustermann", email: "admin@keyeff.de" },
  { id: 2, name: "Anna Schmidt", email: "telefonist1@keyeff.de" },
  { id: 3, name: "Thomas Müller", email: "telefonist2@keyeff.de" },
  { id: 4, name: "Laura Weber", email: "filialleiter@keyeff.de" },
];

const Logs = () => {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch logs
  const { data: logs = mockLogs, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => Promise.resolve(mockLogs),
  });

  // Fetch users
  const { data: users = mockUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => Promise.resolve(mockUsers),
  });

  // Get unique action types
  const actionTypes = [...new Set(logs.map(log => log.action))];

  // Filter logs based on selected filters
  const filteredLogs = logs.filter(log => {
    // Filter by user
    if (selectedUser !== "all" && log.user.id.toString() !== selectedUser) {
      return false;
    }

    // Filter by action
    if (selectedAction !== "all" && log.action !== selectedAction) {
      return false;
    }

    // Filter by date range
    if (dateRange.from && new Date(log.timestamp) < dateRange.from) {
      return false;
    }
    if (dateRange.to && new Date(log.timestamp) > dateRange.to) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !log.details.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Export handlers
  const handleExportExcel = () => {
    const exportData = filteredLogs.map(log => ({
      ID: log.id,
      Zeitstempel: log.timestamp,
      Benutzer: log.user.name,
      Aktion: getActionLabel(log.action),
      Details: log.details
    }));
    exportToExcel(exportData, 'Logs_Export', 'Logs');
  };

  const handleExportPdf = () => {
    const exportData = filteredLogs.map(log => ({
      ID: log.id,
      Zeitstempel: log.timestamp,
      Benutzer: log.user.name,
      Aktion: getActionLabel(log.action),
      Details: log.details
    }));
    exportToPdf(exportData, 'Logs_Export', 'System Logs');
  };

  const handleSendEmail = () => {
    const exportData = filteredLogs.map(log => ({
      ID: log.id,
      Zeitstempel: log.timestamp,
      Benutzer: log.user.name,
      Aktion: getActionLabel(log.action),
      Details: log.details
    }));
    sendDataByEmail(exportData, 'admin@keyeff.de', 'Log Export', 'Anbei finden Sie den angeforderten Log-Export.');
  };

  // Helper function to get readable action labels
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'login':
        return 'Anmeldung';
      case 'logout':
        return 'Abmeldung';
      case 'view_customer':
        return 'Kunde angesehen';
      case 'update_customer':
        return 'Kunde aktualisiert';
      case 'call_log':
        return 'Anruf protokolliert';
      case 'export_report':
        return 'Bericht exportiert';
      case 'system_settings':
        return 'Systemeinstellungen';
      default:
        return action;
    }
  };

  return (
    <AppLayout title="Logs" subtitle="Logs für Datenschutz und Compliance">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Log-Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* User filter */}
              <div className="space-y-2">
                <Label htmlFor="user-filter">Benutzer</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user-filter">
                    <SelectValue placeholder="Alle Benutzer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Benutzer</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action filter */}
              <div className="space-y-2">
                <Label htmlFor="action-filter">Art</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger id="action-filter">
                    <SelectValue placeholder="Alle Arten" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Arten</SelectItem>
                    {actionTypes.map(action => (
                      <SelectItem key={action} value={action}>
                        {getActionLabel(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date range filter */}
              <div className="space-y-2">
                <Label>Zeitraum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd.MM.yyyy")} -{" "}
                            {format(dateRange.to, "dd.MM.yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "dd.MM.yyyy")
                        )
                      ) : (
                        <span>Zeitraum auswählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange as any}
                      locale={de}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search filter */}
              <div className="space-y-2">
                <Label htmlFor="search">Suche</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="In Details suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Export buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleExportExcel}>
                <Download className="mr-2 h-4 w-4" />
                Excel Export
              </Button>
              <Button variant="outline" onClick={handleExportPdf}>
                <Download className="mr-2 h-4 w-4" />
                PDF Export
              </Button>
              <Button variant="outline" onClick={handleSendEmail}>
                <Send className="mr-2 h-4 w-4" />
                Per E-Mail senden
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Zeitstempel</TableHead>
                    <TableHead>Benutzer</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Lade Logs...</TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Keine Logs gefunden</TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>{log.timestamp}</TableCell>
                        <TableCell>{log.user.name}</TableCell>
                        <TableCell>{getActionLabel(log.action)}</TableCell>
                        <TableCell>{log.details}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Logs;
