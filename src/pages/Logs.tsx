import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Email as EmailIcon } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { logsService } from '@/services/api';
import { toast } from 'react-hot-toast';
import { CSVLink } from 'react-csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { sendDataByEmail } from '@/utils/exportUtils';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editLog, setEditLog] = useState<LogEntry | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState<number | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportEmail, setExportEmail] = useState('');

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['logs'],
    queryFn: () => logsService.getLogs()
  });

  if (isLoading) return <div>Lade Protokolle...</div>;
  if (error) return <div>Fehler beim Laden der Protokolle: {error.message}</div>;

  const handleEditClick = (log: LogEntry) => {
    setEditLog(log);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteLogId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // Implement delete logic here
    console.log('Deleting log with ID:', deleteLogId);
    setIsDeleteDialogOpen(false);
    toast.success('Protokoll erfolgreich gelöscht');
  };

  const handleExportClick = () => {
    setExportDialogOpen(true);
  };

  const handleExportToCSV = () => {
    const csvData = logs.map(log => ({
      ID: log.id,
      BenutzerID: log.user_id,
      Aktion: log.action,
      Entität: log.entity,
      EntitätID: log.entity_id,
      Details: log.details,
      IPAdresse: log.ip_address,
      BenutzerAgent: log.user_agent,
      ErstelltAm: log.created_at
    }));
    return csvData;
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Protokolldaten', 10, 10);

    const tableColumn = ['ID', 'BenutzerID', 'Aktion', 'Entität', 'Details', 'Erstellt Am'];
    const tableRows: string[][] = [];

    logs.forEach(log => {
      const createdAtFormatted = format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: de });
      const logData = [
        log.id.toString(),
        log.user_id.toString(),
        log.action,
        log.entity,
        log.details,
        createdAtFormatted
      ];
      tableRows.push(logData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20
    });

    doc.save('protokolle.pdf');
  };

  const handleSendByEmail = async () => {
    if (!exportEmail) {
      toast.error('Bitte gib eine E-Mail-Adresse ein.');
      return;
    }

    const filename = 'protokolle.csv';
    const csvData = handleExportToCSV();

    try {
      await sendDataByEmail(csvData, filename, exportEmail);
      toast.success('E-Mail erfolgreich versendet!');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Fehler beim Senden der E-Mail.');
    }

    setExportDialogOpen(false);
  };

  return (
    <div>
      <h1>Protokolle</h1>
      <Button variant="contained" color="primary" onClick={handleExportClick}>
        Exportieren
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label="Protokolltabelle">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Benutzer</TableCell>
              <TableCell>Aktion</TableCell>
              <TableCell>Entität</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>IP Adresse</TableCell>
              <TableCell>Benutzer Agent</TableCell>
              <TableCell>Erstellt am</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>{log.user_id}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.entity}</TableCell>
                <TableCell>{log.details}</TableCell>
                <TableCell>{log.ip_address}</TableCell>
                <TableCell>{log.user_agent}</TableCell>
                <TableCell>{log.created_at}</TableCell>
                <TableCell>
                  <IconButton aria-label="edit" onClick={() => handleEditClick(log)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDeleteClick(log.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Protokoll bearbeiten</DialogTitle>
        <DialogContent>
          {editLog && (
            <>
              <TextField
                margin="dense"
                label="Aktion"
                fullWidth
                value={editLog.action}
                onChange={e => setEditLog({ ...editLog, action: e.target.value })}
              />
              {/* Add more fields as needed */}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Abbrechen</Button>
          <Button color="primary" onClick={() => setIsEditDialogOpen(false)}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Protokoll löschen?</DialogTitle>
        <DialogContent>Möchten Sie diesen Protokolleintrag wirklich löschen?</DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button color="secondary" onClick={confirmDelete}>
            Löschen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Daten exportieren</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="E-Mail Adresse"
            type="email"
            fullWidth
            value={exportEmail}
            onChange={e => setExportEmail(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSendByEmail}>
                  <EmailIcon />
                </IconButton>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Abbrechen</Button>
          <CSVLink
            data={handleExportToCSV()}
            filename={'protokolle.csv'}
            onClick={() => toast.success('CSV-Datei wird heruntergeladen!')}
          >
            <Button color="primary">Als CSV exportieren</Button>
          </CSVLink>
          <Button color="primary" onClick={handleExportToPDF}>
            Als PDF exportieren
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Logs;
