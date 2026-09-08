import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Snackbar, Alert,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import Sidebar from './Sidebar';
import DashboardShell from './nav/DashboardShell';
import TableToolbar from './shared/TableToolbar';
import EmptyState from './shared/EmptyState';
import ConfirmDialog from './shared/ConfirmDialog';
import UnauthorizedState from './shared/UnauthorizedState';
import useTableControls from '../hooks/useTableControls';

const RecordDashboard = () => {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [vets, setVets] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [adoptedPets, setAdoptedPets] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    date: '', notes: '', diagnosis: '', treatment: '', petId: '', userId: '', veterinarianId: ''
  });

  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });
  const showMessage = (text, severity = 'success') => setMessage({ open: true, text, severity });
  const handleCloseMessage = () => setMessage({ ...message, open: false });

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  if (!token) {
    navigate('/');
  }
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchRecords();
    fetchUsers();
    fetchVets();
  }, []);

  const fetchRecords = () => {
    axios.get('http://localhost:5000/api/records', authHeader)
      .then(res => setRecords(res.data.records || res.data))
      .catch(err => {
        console.error('Error fetching records:', err);
        showMessage('Error fetching records.', 'error');
      });
  };

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/users', authHeader)
      .then(res => {
        const petOwners = res.data.filter(user => user.role === 'user');
        setUsers(petOwners);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        showMessage('Error fetching users.', 'error');
      });
  };

  useEffect(() => {
    if (formData.userId) {
      axios.get(`http://localhost:5000/api/adoption/user/${formData.userId}`, authHeader)
        .then(res => {
          const petsList = res.data.adoptions.map(adoption => adoption.Pet);
          setAdoptedPets(petsList);
        })
        .catch(err => {
          console.error('Error fetching adopted pets:', err);
          setAdoptedPets([]);
          showMessage('Failed to fetch adopted pets.', 'error');
        });
    } else {
      setAdoptedPets([]);
      setFormData(prev => ({ ...prev, petId: '' }));
    }
  }, [formData.userId]);

  const fetchVets = () => {
    axios.get('http://localhost:5000/api/users', authHeader)
      .then(res => {
        const onlyVets = res.data
          .filter(user => user.role === 'veterinarian' && user.Veterinarian)
          .map(user => ({ id: user.Veterinarian.id, name: user.name }));
        setVets(onlyVets);
      }).catch(err => {
        console.error('Error fetching vets:', err);
        showMessage('Error fetching vets.', 'error');
      });
  };

  const handleOpenForm = (record = null) => {
    if (record) {
      setFormData({
        date: record.date, notes: record.notes, diagnosis: record.diagnosis,
        treatment: record.treatment, petId: record.petId, userId: record.userId,
        veterinarianId: record.veterinarianId
      });
      setIsEditing(true);
      setCurrentId(record.id);
    } else {
      setFormData({ date: '', notes: '', diagnosis: '', treatment: '', petId: '', userId: '', veterinarianId: '' });
      setIsEditing(false);
      setCurrentId(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData({ date: '', notes: '', diagnosis: '', treatment: '', petId: '', userId: '', veterinarianId: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = () => {
    const request = isEditing
      ? axios.put(`http://localhost:5000/api/records/${currentId}`, formData, authHeader)
      : axios.post('http://localhost:5000/api/records', formData, authHeader);

    request
      .then(() => {
        fetchRecords();
        handleCloseForm();
        showMessage(isEditing ? 'Record updated successfully.' : 'Record created successfully.');
      })
      .catch(err => {
        console.error('Error submitting form:', err);
        showMessage('Failed to save the record.', 'error');
      });
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/records/${id}`, authHeader)
      .then(() => {
        fetchRecords();
        showMessage('Record deleted successfully.');
      })
      .catch(err => {
        console.error('Error deleting record:', err);
        showMessage('Failed to delete the record.', 'error');
      })
      .finally(() => setDeleteTarget(null));
  };

  const { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage, pageRows, filteredCount } =
    useTableControls(records, { searchKeys: ['Pet.name', 'User.name', 'diagnosis'] });

  if (userRole !== 'admin') return <UnauthorizedState />;

  return (
    <DashboardShell title="Medical Records" roleLabel="Admin" nav={<Sidebar />}>
      <TableToolbar
        title="Medical Records"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by pet, owner, diagnosis..."
        addLabel="Add Record"
        onAdd={() => handleOpenForm()}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pet</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Vet</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState title="No records found" description="Medical records will show up here." />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map(record => (
                <TableRow key={record.id} hover>
                  <TableCell>{record.Pet?.name || 'N/A'}</TableCell>
                  <TableCell>{record.User?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {record.veterinarianId
                      ? vets.find(vet => vet.id === record.veterinarianId)?.name || 'N/A'
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.diagnosis}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenForm(record)} aria-label="Edit"><Edit fontSize="small" /></IconButton>
                    <IconButton onClick={() => setDeleteTarget(record)} aria-label="Delete"><Delete fontSize="small" /></IconButton>
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
        <DialogTitle>{isEditing ? 'Edit Record' : 'New Record'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Date" type="date" name="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.date} onChange={handleFormChange} />
          <TextField margin="dense" label="Notes" name="notes" fullWidth multiline rows={2} value={formData.notes} onChange={handleFormChange} />
          <TextField margin="dense" label="Diagnosis" name="diagnosis" fullWidth value={formData.diagnosis} onChange={handleFormChange} />
          <TextField margin="dense" label="Treatment" name="treatment" fullWidth value={formData.treatment} onChange={handleFormChange} />
          <TextField
            margin="dense" select label="Pet" name="petId" fullWidth value={formData.petId}
            onChange={handleFormChange} disabled={!formData.userId || adoptedPets.length === 0}
          >
            <MenuItem value="">Select Pet</MenuItem>
            {adoptedPets.map(pet => (<MenuItem key={pet.id} value={pet.id}>{pet.name}</MenuItem>))}
          </TextField>
          <TextField margin="dense" select label="User" name="userId" fullWidth value={formData.userId} onChange={handleFormChange}>
            {users.map(user => (<MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>))}
          </TextField>
          <TextField margin="dense" select label="Veterinarian" name="veterinarianId" fullWidth value={formData.veterinarianId} onChange={handleFormChange}>
            {vets.map(vet => (<MenuItem key={vet.id} value={vet.id}>{vet.name}</MenuItem>))}
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
        title="Delete record?"
        description="This will permanently remove this medical record."
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

export default RecordDashboard;
