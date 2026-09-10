import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Select, MenuItem, Snackbar, Alert, Typography,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import Sidebar from './Sidebar';
import DashboardShell from './nav/DashboardShell';
import TableToolbar from './shared/TableToolbar';
import EmptyState from './shared/EmptyState';
import ConfirmDialog from './shared/ConfirmDialog';
import UnauthorizedState from './shared/UnauthorizedState';
import MobileCardList from './shared/MobileCardList';
import useTableControls from '../hooks/useTableControls';

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'user',
    specialization: '', yearsOfExperience: '', licenseNumber: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/users', config)
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error('Error fetching users:', err);
        showMessage('Error fetching users.', 'error');
      });
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', password: '', role: 'user',
      specialization: '', yearsOfExperience: '', licenseNumber: '',
    });
    setCurrentUserId(null);
    setIsEditing(false);
  };

  const handleOpenForm = (user = null) => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        specialization: user.Veterinarian ? user.Veterinarian.specialization : '',
        yearsOfExperience: user.Veterinarian ? user.Veterinarian.yearsOfExperience : '',
        licenseNumber: user.Veterinarian ? user.Veterinarian.licenseNumber : '',
      });
      setIsEditing(true);
      setCurrentUserId(user.id);
    } else {
      resetForm();
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    resetForm();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = () => {
    if (isEditing && currentUserId) {
      axios.put(`http://localhost:5000/api/users/${currentUserId}`, formData, config)
        .then((res) => {
          setUsers((prev) => prev.map((user) => (user.id === currentUserId ? res.data : user)));
          handleCloseForm();
          showMessage('User updated successfully.');
        })
        .catch((err) => {
          console.error('Error updating user:', err);
          showMessage('Error updating user.', 'error');
        });
    } else {
      axios.post('http://localhost:5000/api/users/register', formData, config)
        .then((res) => {
          setUsers((prev) => [...prev, res.data.user]);
          handleCloseForm();
          showMessage('User added successfully.');
        })
        .catch((err) => {
          console.error('Error adding user:', err);
          showMessage('Error adding user.', 'error');
        });
    }
  };

  const handleDeleteUser = (id) => {
    axios.delete(`http://localhost:5000/api/users/${id}`, config)
      .then(() => {
        setUsers((prev) => prev.filter((user) => user.id !== id));
        showMessage('User deleted successfully.');
      })
      .catch((err) => {
        console.error('Error deleting user:', err);
        showMessage('Error deleting user.', 'error');
      })
      .finally(() => setDeleteTarget(null));
  };

  const { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage, pageRows, filteredCount } =
    useTableControls(users, { searchKeys: ['name', 'email', 'role'] });

  if (userRole !== 'admin') return <UnauthorizedState />;

  return (
    <DashboardShell title="Users" roleLabel="Admin" nav={<Sidebar />}>
      <TableToolbar
        title="Users"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, role..."
        addLabel="Add User"
        onAdd={() => handleOpenForm()}
      />

      <MobileCardList
        rows={pageRows}
        emptyTitle="No users found"
        emptyDescription="Add a user to get started."
        pagination={{
          count: filteredCount,
          page,
          onPageChange: (_, p) => setPage(p),
          rowsPerPage,
          onRowsPerPageChange: (e) => setRowsPerPage(Number(e.target.value)),
          rowsPerPageOptions: [5, 10, 25],
        }}
        renderCard={(user) => (
          <Paper key={user.id} variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{user.role}</Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleOpenForm(user)} aria-label="Edit" size="small">
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton onClick={() => setDeleteTarget(user)} aria-label="Delete" size="small">
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        )}
      />

      <TableContainer component={Paper} sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState title="No users found" description="Add a user to get started." />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenForm(user)} aria-label="Edit">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => setDeleteTarget(user)} aria-label="Delete">
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
        <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" name="name" fullWidth value={formData.name} onChange={handleFormChange} margin="normal" />
          <TextField label="Email" name="email" fullWidth value={formData.email} onChange={handleFormChange} margin="normal" />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleFormChange}
            margin="normal"
            placeholder={isEditing ? 'Leave empty to keep current password' : ''}
          />
          <Select label="Role" name="role" value={formData.role} onChange={handleFormChange} fullWidth sx={{ mt: 2 }}>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="veterinarian">Veterinarian</MenuItem>
          </Select>

          {formData.role === 'veterinarian' && (
            <>
              <TextField label="Specialization" name="specialization" fullWidth value={formData.specialization} onChange={handleFormChange} margin="normal" />
              <TextField label="Years of Experience" name="yearsOfExperience" fullWidth value={formData.yearsOfExperience} onChange={handleFormChange} margin="normal" type="number" />
              <TextField label="License Number" name="licenseNumber" fullWidth value={formData.licenseNumber} onChange={handleFormChange} margin="normal" />
            </>
          )}
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
        title="Delete user?"
        description={`This will permanently remove ${deleteTarget?.name || 'this user'}.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteUser(deleteTarget.id)}
      />

      <Snackbar open={message.open} autoHideDuration={3000} onClose={handleCloseMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseMessage} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </DashboardShell>
  );
};

export default UserDashboard;
