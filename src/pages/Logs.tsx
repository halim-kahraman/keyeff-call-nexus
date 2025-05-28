
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
import { exportToExcel, exportToPdf, sendDataByEmail } from "@/utils/exportUtils";
import api from "@/services/api";

const Logs = () => {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch logs from API
  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ['logs', selectedUser, selectedAction, dateRange, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedUser !== "all") params.append('user_id', selectedUser);
      if (selectedAction !== "all") params.append('action', selectedAction);
      if (dateRange.from) params.append('start_date', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) params.append('end_date', format(dateRange.to, 'yyyy-MM-dd'));
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await api.get(`/logs/list.php?${params.toString()}`);
      return response.data;
    },
  });

  // Fetch users for filter
  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users/list.php');
      return response.data;
    },
  });

  const logs = logsResponse?.data || [];
  const users = usersResponse?.data || [];

  // Get unique action types from logs with proper typing
  const actionTypes: string[] = [...new Set(logs.map((log: any) => log.action).filter((action: any): action is string => typeof action === 'string'))];

  // Export handlers
  const handleExportExcel = () => {
    const exportData = logs.map((log: any) => ({
      ID: log.id,
      Zeitstempel: log.created_at,
      Benutzer: log.user_name || log.user_id,
      Aktion: getActionLabel(log.action),
      Details: log.details
    }));
    exportToExcel(exportData, 'Logs_Export', 'Logs');
  };

  const handleExportPdf = () => {
    const exportData = logs.map((log: any) => ({
      ID: log.id,
      Zeitstempel: log.created_at,
      Benutzer: log.user_name || log.user_id,
      Aktion: getActionLabel(log.action),
      Details: log.details
    }));
    exportToPdf(exportData, 'Logs_Export', 'System Logs');
  };

  const handleSendEmail = () => {
    const exportData = logs.map((log: any) => ({
      ID: log.id,
      Zeitstempel: log.created_at,
      Benutzer: log.user_name || log.user_id,
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
                    {users.map((user: any) => (
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
                    {actionTypes.map((action) => (
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
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Keine Logs gefunden</TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>{log.created_at}</TableCell>
                        <TableCell>{log.user_name || log.user_id}</TableCell>
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
