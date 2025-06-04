
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { logsService } from '@/services/api';

interface Log {
  id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  details: string;
  created_at: string;
}

const Logs: React.FC = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await logsService.getLogs();
      return response.data || [];
    }
  });

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'login':
        return 'default';
      case 'update':
      case 'edit':
        return 'secondary';
      case 'delete':
      case 'logout':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="System-Logs" subtitle="Aktivitäten und Änderungen verfolgen">
        <div>Lade Logs...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="System-Logs" subtitle="Aktivitäten und Änderungen verfolgen">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitätsprotokoll</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitstempel</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: Log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString('de-DE')}
                    </TableCell>
                    <TableCell className="font-medium">{log.user_name}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.entity_type}</TableCell>
                    <TableCell className="max-w-md truncate">{log.details}</TableCell>
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
