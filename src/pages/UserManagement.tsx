import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Snackbar,
  AlertColor
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation } from 'react-query';
import { userService } from '@/services/api';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  filiale: string;
}

const UserManagement: React.FC = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [filiale, setFiliale] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers()
  });

  const handleOpenEditDialog = (user: User) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setFiliale(user.filiale);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleChangeRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRole(event.target.value);
  };

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  const handleChangeFiliale = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiliale(event.target.value);
  };

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => userService.createUser(userData),
    onSuccess: () => {
      refetch();
      setIsCreateDialogOpen(false);
      toast.success('Benutzer erfolgreich erstellt');
    },
    onError: (error: any) => {
      toast.error('Fehler beim Erstellen des Benutzers');
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: any) => userService.updateUser(selectedUser!.id, userData),
    onSuccess: () => {
      refetch();
      setIsEditDialogOpen(false);
      toast.success('Benutzer erfolgreich aktualisiert');
    },
    onError: (error: any) => {
      toast.error('Fehler beim Aktualisieren des Benutzers');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      refetch();
      toast.success('Benutzer erfolgreich gelöscht');
    },
    onError: (error: any) => {
      toast.error('Fehler beim Löschen des Benutzers');
    }
  });

  const handleCreateUser = () => {
    createUserMutation.mutate({ name, email, role, password, filiale });
  };

  const handleUpdateUser = () => {
    updateUserMutation.mutate({ name, email, role, filiale, password });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleSnackbarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return <Alert severity="info">Benutzer werden geladen...</Alert>;
  }

  if (error) {
    return <Alert severity="error">Fehler beim Laden der Benutzer.</Alert>;
  }

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpenCreateDialog}
        sx={{ mb: 2 }}
      >
        Benutzer erstellen
      </Button>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="Benutzertabelle">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>E-Mail</TableCell>
              <TableCell>Rolle</TableCell>
              <TableCell>Filiale</TableCell>
              <TableCell align="right">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {user.name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.filiale}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit" onClick={() => handleOpenEditDialog(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDeleteUser(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Benutzer bearbeiten</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={name}
            onChange={handleChangeName}
          />
          <TextField
            margin="dense"
            label="E-Mail"
            type="email"
            fullWidth
            value={email}
            onChange={handleChangeEmail}
          />
          <TextField
            margin="dense"
            label="Filiale"
            type="text"
            fullWidth
            value={filiale}
            onChange={handleChangeFiliale}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-select-label">Rolle</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={role}
              label="Rolle"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="filialleiter">Filialleiter</MenuItem>
              <MenuItem value="telefonist">Telefonist</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Passwort"
            type="password"
            fullWidth
            onChange={handleChangePassword}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Abbrechen</Button>
          <Button onClick={handleUpdateUser}>Speichern</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onClose={handleCloseCreateDialog}>
        <DialogTitle>Benutzer erstellen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={name}
            onChange={handleChangeName}
          />
          <TextField
            margin="dense"
            label="E-Mail"
            type="email"
            fullWidth
            value={email}
            onChange={handleChangeEmail}
          />
          <TextField
            margin="dense"
            label="Filiale"
            type="text"
            fullWidth
            value={filiale}
            onChange={handleChangeFiliale}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-create-select-label">Rolle</InputLabel>
            <Select
              labelId="role-create-select-label"
              id="role-create-select"
              value={role}
              label="Rolle"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="filialleiter">Filialleiter</MenuItem>
              <MenuItem value="telefonist">Telefonist</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Passwort"
            type="password"
            fullWidth
            onChange={handleChangePassword}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Abbrechen</Button>
          <Button onClick={handleCreateUser}>Erstellen</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
