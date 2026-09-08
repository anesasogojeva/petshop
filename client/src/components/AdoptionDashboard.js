import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, MenuItem, Snackbar, Alert,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import Sidebar from './Sidebar';
import DashboardShell from './nav/DashboardShell';
import TableToolbar from './shared/TableToolbar';
import EmptyState from './shared/EmptyState';
import ConfirmDialog from './shared/ConfirmDialog';
import UnauthorizedState from './shared/UnauthorizedState';
import useTableControls from '../hooks/useTableControls';

const AdoptionDashboard = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [pets, setPets] = useState([]);
  const [users, setUsers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ petId: '', userId: '' });
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });
  const token = localStorage.getItem('accessToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const showMessage = (text, severity = 'success') => setMessage({ open: true, text, severity });
  const handleCloseMessage = () => setMessage({ ...message, open: false });

  useEffect(() => {
    fetchAdoptions();
    fetchPets();
    fetchUsers();
  }, []);

  const fetchAdoptions = () => {
    axios.get('http://localhost:5000/api/adoption', authHeader)
      .then(res => setAdoptions(res.data.adoptions))
      .catch(err => {
        console.error('Error fetching adoption:', err);
        showMessage('Error fetching adoption.', 'error');
      });
  };

  const fetchPets = () => {
    axios.get('http://localhost:5000/api/pets', authHeader)
      .then(res => setPets(res.data))
      .catch(err => {
        console.error('Error fetching pets:', err);
        showMessage('Error fetching pets.', 'error');
      });
  };

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/users', authHeader)
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error('Error fetching users:', err);
        showMessage('Error fetching users.', 'error');
      });
  };

  const handleOpenForm = (adoption = null) => {
    if (adoption) {
      setFormData({ petId: adoption.petId, userId: adoption.userId });
      setIsEditing(true);
      setCurrentId(adoption.id);
    } else {
      setFormData({ petId: '', userId: '' });
      setIsEditing(false);
      setCurrentId(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData({ petId: '', userId: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitForm = () => {
    const request = isEditing && currentId
      ? axios.put(`http://localhost:5000/api/adoption/${currentId}`, formData, authHeader)
      : axios.post(`http://localhost:5000/api/adoption`, formData, authHeader);

    request
      .then(() => {
        fetchAdoptions();
        handleCloseForm();
        showMessage(isEditing ? 'Adoption updated successfully.' : 'Adoption created successfully.');
      })
      .catch(err => {
        console.error(isEditing ? 'Error updating adoption:' : 'Error creating adoption:', err);
        showMessage('There was an error while saving the adoption.', 'error');
      });
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/adoption/${id}`, authHeader)
      .then(() => {
        fetchAdoptions();
        showMessage('Adoption deleted successfully.');
      })
      .catch(err => {
        console.error('Error deleting adoption:', err);
        showMessage('Error deleting adoption.', 'error');
      })
      .finally(() => setDeleteTarget(null));
  };

  const { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage, pageRows, filteredCount } =
    useTableControls(adoptions, { searchKeys: ['Pet.name', 'User.name', 'User.email'] });

  const userRole = localStorage.getItem('role');
  if (userRole !== 'admin') return <UnauthorizedState />;

  return (
    <DashboardShell title="Adoptions" roleLabel="Admin" nav={<Sidebar />}>
      <TableToolbar
        title="Adoptions"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by pet, owner..."
        addLabel="Adopt Pet"
        onAdd={() => handleOpenForm()}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pet Name</TableCell>
              <TableCell>Adoption ID</TableCell>
              <TableCell>User Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState title="No adoptions found" description="Adoption records will show up here." />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>{a.Pet?.name || 'N/A'}</TableCell>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.User?.name || 'N/A'}</TableCell>
                  <TableCell>{a.User?.email || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenForm(a)} aria-label="Edit">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => setDeleteTarget(a)} aria-label="Delete">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>{isEditing ? 'Edit Adoption' : 'New Adoption'}</DialogTitle>
        <DialogContent>
          <TextField margin="normal" select label="Pet" name="petId" fullWidth value={formData.petId} onChange={handleFormChange}>
            {pets.map((pet) => (<MenuItem key={pet.id} value={pet.id}>{pet.name}</MenuItem>))}
          </TextField>

          <TextField margin="normal" select label="User" name="userId" fullWidth value={formData.userId} onChange={handleFormChange}>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>{user.name} ({user.email})</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="inherit">Cancel</Button>
          <Button onClick={handleSubmitForm} variant="contained" startIcon={<Add />}>
            {isEditing ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete adoption?"
        description="This will permanently remove this adoption record."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget.id)}
      />

      <Snackbar open={message.open} autoHideDuration={3000} onClose={handleCloseMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseMessage} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </DashboardShell>
  );
};

export default AdoptionDashboard;
