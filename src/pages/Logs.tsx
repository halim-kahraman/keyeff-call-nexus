
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Mail } from 'lucide-react';
import { logsService } from '@/services/api';
import { exportToCSV, exportToExcel, exportToPdf } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  id: number;
  user_id: number;
  action: string;
  entity: string;
  entity_id: number;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const Logs: React.FC = () => {
  const [exportEmail, setExportEmail] = useState('');
  const { toast } = useToast();

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await logsService.getLogs();
      return response.data || [];
    }
  });

  const handleExportCSV = () => {
    exportToCSV(logs, 'protokolle');
    toast({
      title: "Export erfolgreich",
      description: "CSV-Datei wurde heruntergeladen.",
    });
  };

  const handleExportExcel = () => {
    exportToExcel(logs, 'protokolle');
    toast({
      title: "Export erfolgreich", 
      description: "Excel-Datei wurde heruntergeladen.",
    });
  };

  const handleExportPDF = () => {
    exportToPdf(logs, 'Protokolldaten', 'protokolle');
    toast({
      title: "Export erfolgreich",
      description: "PDF-Datei wurde heruntergeladen.",
    });
  };

  if (isLoading) {
    return (
      <AppLayout title="Protokolle" subtitle="System-Aktivitäten und Logs">
        <div>Lade Protokolle...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Protokolle" subtitle="System-Aktivitäten und Logs">
        <div>Fehler beim Laden der Protokolle</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Protokolle" subtitle="System-Aktivitäten und Logs">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>System-Protokolle</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" onClick={handleExportExcel}>
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Entität</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Adresse</TableHead>
                  <TableHead>Erstellt am</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: LogEntry) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.user_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.entity}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                    <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
                    <TableCell>{new Date(log.created_at).toLocaleString('de-DE')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Logs;
