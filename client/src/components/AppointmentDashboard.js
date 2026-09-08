import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, MenuItem, Snackbar, Alert, Typography,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import Sidebar from './Sidebar';
import DashboardShell from './nav/DashboardShell';
import TableToolbar from './shared/TableToolbar';
import EmptyState from './shared/EmptyState';
import ConfirmDialog from './shared/ConfirmDialog';
import UnauthorizedState from './shared/UnauthorizedState';
import TimeSlotPicker from './shared/TimeSlotPicker';
import useTableControls from '../hooks/useTableControls';

const AppointmentDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [users, setUsers] = useState([]);
  const [adoptedPets, setAdoptedPets] = useState([]);
  const [slots, setSlots] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });

  const showMessage = (text, severity = 'success') => setMessage({ open: true, text, severity });
  const handleCloseMessage = () => setMessage({ ...message, open: false });

  const [formData, setFormData] = useState({
    date: '', time: '', reason: '', userId: '', petId: '',
    veterinarianId: '', vetUserId: '', slotId: '',
  });

  const token = localStorage.getItem('accessToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const formatTimeHHMM = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (time) => {
    if (!time) return '';
    if (time.includes('T')) {
      const date = new Date(time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return formatTimeHHMM(time);
  };

  useEffect(() => {
    fetchAppointments();
    fetchPets();
    fetchVets();
    fetchUsers();
  }, []);

  const fetchAppointments = () => {
    axios.get('http://localhost:5000/api/appointments', authHeader)
      .then(res => setAppointments(res.data.appointments))
      .catch(err => {
        console.error('Error fetching appointments:', err);
        showMessage('Failed to fetch appointments.', 'error');
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

  const fetchVets = () => {
    axios.get('http://localhost:5000/api/users', authHeader)
      .then(res => {
        const onlyVets = res.data
          .filter(user => user.role === 'veterinarian' && user.Veterinarian)
          .map(user => ({ id: user.Veterinarian.id, userId: user.id, name: user.name }));
        setVets(onlyVets);
      })
      .catch(err => {
        console.error('Error fetching veterinarians:', err);
        showMessage('Error fetching veterinarians.', 'error');
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

  useEffect(() => {
    if (formData.date && formData.vetUserId) {
      setLoadingSlots(true);
      axios.get('http://localhost:5000/api/slots/available', {
        params: { date: formData.date, userId: formData.vetUserId },
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setSlots(Array.isArray(res.data.slots) ? res.data.slots : []);
        })
        .catch(err => {
          console.error('Error fetching available slots:', err);
          setSlots([]);
          showMessage('Failed to fetch available slots.', 'error');
        })
        .finally(() => setLoadingSlots(false));

      setFormData(prev => ({ ...prev, time: '', slotId: '' }));
    } else {
      setSlots([]);
      setFormData(prev => ({ ...prev, time: '', slotId: '' }));
    }
  }, [formData.date, formData.vetUserId, token]);

  const handleOpenForm = (appointment = null) => {
    if (!vets.length && appointment) return;

    if (appointment) {
      const vet = vets.find(v => v.id === appointment.veterinarianId);
      setFormData({
        date: appointment.date,
        time: appointment.Slot?.startTime || '',
        reason: appointment.reason,
        petId: appointment.petId,
        veterinarianId: appointment.veterinarianId,
        userId: appointment.userId ?? appointment.User?.id ?? '',
        vetUserId: vet?.userId || '',
        slotId: appointment.slotId,
      });
      setIsEditing(true);
      setCurrentId(appointment.id);
    } else {
      setFormData({
        date: '', time: '', reason: '', vetUserId: '', petId: '',
        veterinarianId: '', slotId: '', userId: '',
      });
      setIsEditing(false);
      setCurrentId(null);
      setSlots([]);
    }

    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData({ date: '', time: '', reason: '', userId: '', petId: '', veterinarianId: '', slotId: '' });
    setSlots([]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === 'userId') {
      setFormData(prev => ({ ...prev, userId: value, petId: '' }));
    } else if (name === 'veterinarianId') {
      const selectedVet = vets.find(v => v.id === value);
      setFormData(prev => ({
        ...prev, veterinarianId: value, vetUserId: selectedVet ? selectedVet.userId : '', time: '', slotId: ''
      }));
    } else if (name === 'time') {
      const slot = slots.find(s => s.startTime === value);
      setFormData(prev => ({ ...prev, time: value, slotId: slot ? slot.id : '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitForm = () => {
    if (!formData.slotId) {
      showMessage('Please select a valid slot.', 'error');
      return;
    }

    const payload = {
      reason: formData.reason,
      userId: formData.userId,
      petId: formData.petId,
      veterinarianId: formData.veterinarianId,
      slotId: formData.slotId,
    };

    const request = isEditing && currentId
      ? axios.put(`http://localhost:5000/api/appointments/${currentId}`, payload, authHeader)
      : axios.post('http://localhost:5000/api/appointments', payload, authHeader);

    request
      .then(() => {
        setSlots(prevSlots => prevSlots.filter(slot => slot.id !== formData.slotId));
        fetchAppointments();
        handleCloseForm();
        showMessage(isEditing ? 'Appointment updated successfully.' : 'Appointment added successfully.');
      })
      .catch(err => {
        console.error(isEditing ? 'Error updating appointment:' : 'Error creating appointment:', err);
        showMessage('Failed to save appointment.', 'error');
      });
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/appointments/${id}`, authHeader)
      .then(() => {
        fetchAppointments();
        showMessage('Appointment deleted successfully.');
      })
      .catch(err => {
        console.error('Error deleting appointment:', err);
        showMessage('Failed to delete appointment.', 'error');
      })
      .finally(() => setDeleteTarget(null));
  };

  const { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage, pageRows, filteredCount } =
    useTableControls(appointments, { searchKeys: ['Pet.name', 'Veterinarian.User.name', 'reason'] });

  const userRole = localStorage.getItem('role');
  if (userRole !== 'admin') return <UnauthorizedState />;

  return (
    <DashboardShell title="Appointments" roleLabel="Admin" nav={<Sidebar />}>
      <TableToolbar
        title="Appointments"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by pet, vet, reason..."
        addLabel="Add Appointment"
        onAdd={() => handleOpenForm()}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Pet</TableCell>
              <TableCell>Veterinarian</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState title="No appointments found" description="New bookings will show up here." />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map(appointment => (
                <TableRow key={appointment.id} hover>
                  <TableCell>{appointment.Slot?.date || 'N/A'}</TableCell>
                  <TableCell>{formatTime(appointment.Slot?.startTime)}</TableCell>
                  <TableCell>{appointment.Pet?.name || 'N/A'}</TableCell>
                  <TableCell>{appointment.Veterinarian?.User?.name || 'N/A'}</TableCell>
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenForm(appointment)} aria-label="Edit">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => setDeleteTarget(appointment)} aria-label="Delete">
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

      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Appointment' : 'Add Appointment'}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>1. Pet Owner &amp; Pet</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField select label="User (Pet Owner)" name="userId" sx={{ flex: 1, minWidth: 160 }} value={formData.userId} onChange={handleFormChange}>
              <MenuItem value="">Select User</MenuItem>
              {users.map(user => (<MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>))}
            </TextField>

            <TextField
              select label="Pet" name="petId" sx={{ flex: 1, minWidth: 160 }} value={formData.petId}
              onChange={handleFormChange} disabled={!formData.userId || adoptedPets.length === 0}
            >
              <MenuItem value="">Select Pet</MenuItem>
              {adoptedPets.map(pet => (<MenuItem key={pet.id} value={pet.id}>{pet.name}</MenuItem>))}
            </TextField>
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>2. Veterinarian &amp; Date</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField select label="Veterinarian" name="veterinarianId" sx={{ flex: 1, minWidth: 160 }} value={formData.veterinarianId} onChange={handleFormChange}>
              <MenuItem value="">Select Veterinarian</MenuItem>
              {vets.map(vet => (<MenuItem key={vet.id} value={vet.id}>{vet.name}</MenuItem>))}
            </TextField>

            <TextField
              label="Date" type="date" name="date" sx={{ flex: 1, minWidth: 160 }}
              value={formData.date} onChange={handleFormChange} InputLabelProps={{ shrink: true }}
              disabled={!formData.veterinarianId}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>3. Time</Typography>
          <Box sx={{ opacity: formData.date && formData.veterinarianId ? 1 : 0.5, pointerEvents: formData.date && formData.veterinarianId ? 'auto' : 'none' }}>
            <TimeSlotPicker
              slots={slots}
              selectedSlotId={formData.slotId}
              loading={loadingSlots}
              disabledHint={!formData.date || !formData.veterinarianId ? 'Choose a veterinarian and date first' : null}
              onSelect={(slot) => setFormData(prev => ({ ...prev, time: slot.startTime, slotId: slot.id }))}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>4. Reason</Typography>
          <TextField label="Reason" name="reason" fullWidth multiline rows={2} value={formData.reason} onChange={handleFormChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="inherit">Cancel</Button>
          <Button onClick={handleSubmitForm} variant="contained" startIcon={<Add />} disabled={!formData.slotId}>
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete appointment?"
        description="This will permanently remove this appointment."
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

export default AppointmentDashboard;
