import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, TextField, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Snackbar, Alert, Typography,
} from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { Delete, Edit, Add } from '@mui/icons-material';
import Sidebar from './Sidebar';
import DashboardShell from './nav/DashboardShell';
import TableToolbar from './shared/TableToolbar';
import EmptyState from './shared/EmptyState';
import ConfirmDialog from './shared/ConfirmDialog';
import ImageManagerDialog from './shared/ImageManagerDialog';
import UnauthorizedState from './shared/UnauthorizedState';
import MobileCardList from './shared/MobileCardList';
import useTableControls from '../hooks/useTableControls';

const VeterinarianDashboard = () => {
  const [veterinarians, setVeterinarians] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    password: '',
    specialization: '',
    yearsOfExperience: '',
    licenseNumber: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentVeterinarianId, setCurrentVeterinarianId] = useState(null);
  const [imageDialogOpen, setImageOpen] = useState(false);
  const [currentVeterinarian, setCurrentProd] = useState(null);
  const [veterinarianImages, setVeterinarianImages] = useState(null);
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

  const getUserIdFromToken = () => {
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.userId;
    }
    return null;
  };

  useEffect(() => {
    fetchVeterinarians();
    const userId = getUserIdFromToken();
    setFormData((prev) => ({ ...prev, userId: userId || '' }));
  }, []);

  const fetchVeterinarians = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/veterinarian`, config)
      .then((res) => setVeterinarians(res.data))
      .catch((err) => {
        console.error('Error fetching veterinarians:', err);
        showMessage('Error fetching veterinarians.', 'error');
      });
  };

  const resetForm = () => {
    setFormData({
      userId: '', name: '', email: '', password: '',
      specialization: '', yearsOfExperience: '', licenseNumber: '',
    });
    setCurrentVeterinarianId(null);
    setIsEditing(false);
  };

  const handleOpenForm = (veterinarian = null) => {
    if (veterinarian) {
      setFormData({
        userId: veterinarian.userId,
        name: veterinarian.User?.name || '',
        email: veterinarian.User?.email || '',
        password: '',
        specialization: veterinarian.specialization,
        yearsOfExperience: veterinarian.yearsOfExperience,
        licenseNumber: veterinarian.licenseNumber,
      });
      setIsEditing(true);
      setCurrentVeterinarianId(veterinarian.id);
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
    if (isEditing && currentVeterinarianId) {
      axios
        .put(`${process.env.REACT_APP_API_URL}/api/veterinarian/${currentVeterinarianId}`, formData, config)
        .then((res) => {
          setVeterinarians((prev) => prev.map((v) => (v.id === currentVeterinarianId ? res.data : v)));
          handleCloseForm();
          showMessage('Veterinarian updated successfully.');
        })
        .catch((err) => {
          console.error('Error updating veterinarian:', err);
          showMessage('Error updating veterinarian.', 'error');
        });
    } else {
      const dataToSend = { ...formData, role: 'veterinarian' };
      axios
        .post(`${process.env.REACT_APP_API_URL}/api/users/register`, dataToSend, config)
        .then((res) => {
          if (res.data.veterinarian) {
            setVeterinarians((prev) => [...prev, res.data.veterinarian]);
          } else {
            fetchVeterinarians();
          }
          handleCloseForm();
          showMessage('Veterinarian added successfully.');
        })
        .catch((err) => {
          console.error('Error adding Veterinarian:', err);
          showMessage('Error adding Veterinarian.', 'error');
        });
    }
  };

  const handleDeleteVeterinarian = (id) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/api/veterinarian/${id}`, config)
      .then(() => {
        setVeterinarians((prev) => prev.filter((v) => v.id !== id));
        showMessage('Veterinarian deleted successfully.');
      })
      .catch((err) => {
        console.error('Error deleting veterinarian:', err);
        showMessage('Error deleting veterinarian.', 'error');
      })
      .finally(() => setDeleteTarget(null));
  };

  const fetchVeterinarianImages = async (veterinarianId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/veterinarian/${veterinarianId}/image`, config);
      setVeterinarianImages(res.data.images || []);
    } catch (err) {
      console.error('Error fetching veterinarian images:', err);
      showMessage('Error fetching veterinarian images.', 'error');
    }
  };

  const handleOpenImages = (veterinarian) => {
    setCurrentProd(veterinarian);
    setVeterinarianImages(null);
    setImageOpen(true);
    fetchVeterinarianImages(veterinarian.id);
  };

  const handleAddImage = async (imageFile) => {
    if (!currentVeterinarian?.id || !imageFile) return;
    const formDataUpload = new FormData();
    formDataUpload.append('image', imageFile);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/veterinarian/${currentVeterinarian.id}/image`,
        formDataUpload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      await fetchVeterinarianImages(currentVeterinarian.id);
      showMessage('Image uploaded successfully.');
    } catch (err) {
      console.error('Error uploading image:', err);
      showMessage('Error uploading image.', 'error');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!currentVeterinarian?.id || !imageId) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/veterinarian/${currentVeterinarian.id}/image/${imageId}`, config);
      await fetchVeterinarianImages(currentVeterinarian.id);
      showMessage('Image deleted successfully.');
    } catch (err) {
      console.error('Error deleting image:', err);
      showMessage('Error deleting image.', 'error');
    }
  };

  const { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage, pageRows, filteredCount } =
    useTableControls(veterinarians, { searchKeys: ['User.name', 'specialization', 'licenseNumber'] });

  if (userRole !== 'admin') return <UnauthorizedState />;

  return (
    <DashboardShell title="Veterinarians" roleLabel="Admin" nav={<Sidebar />}>
      <TableToolbar
        title="Veterinarians"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, specialization..."
        addLabel="Add Veterinarian"
        onAdd={() => handleOpenForm()}
      />

      <MobileCardList
        rows={pageRows}
        emptyTitle="No veterinarians found"
        emptyDescription="Add a veterinarian to get started."
        pagination={{
          count: filteredCount,
          page,
          onPageChange: (_, p) => setPage(p),
          rowsPerPage,
          onRowsPerPageChange: (e) => setRowsPerPage(Number(e.target.value)),
          rowsPerPageOptions: [5, 10, 25],
        }}
        renderCard={(v) => (
          <Paper key={v.id} variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">{v.User?.name || 'Unknown'}</Typography>
                <Typography variant="body2" color="text.secondary">{v.specialization}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {v.yearsOfExperience} yrs experience · License {v.licenseNumber}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleOpenImages(v)} aria-label="Manage images" size="small">
                  <PhotoLibraryIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => handleOpenForm(v)} aria-label="Edit" size="small">
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton onClick={() => setDeleteTarget(v)} aria-label="Delete" size="small">
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
              <TableCell>Specialization</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>License Number</TableCell>
              <TableCell>Images</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState title="No veterinarians found" description="Add a veterinarian to get started." />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>{v.User?.name || 'Unknown'}</TableCell>
                  <TableCell>{v.specialization}</TableCell>
                  <TableCell>{v.yearsOfExperience}</TableCell>
                  <TableCell>{v.licenseNumber}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenImages(v)} aria-label="Manage images">
                      <PhotoLibraryIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenForm(v)} aria-label="Edit">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => setDeleteTarget(v)} aria-label="Delete">
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
        <DialogTitle>{isEditing ? 'Edit Veterinarian' : 'Add New Veterinarian'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" name="name" fullWidth value={formData.name} onChange={handleFormChange} margin="normal" />
          <TextField label="Email" name="email" fullWidth value={formData.email} onChange={handleFormChange} margin="normal" />
          {!isEditing && (
            <TextField label="Password" name="password" type="password" fullWidth value={formData.password} onChange={handleFormChange} margin="normal" />
          )}
          <TextField label="Specialization" name="specialization" fullWidth value={formData.specialization} onChange={handleFormChange} margin="normal" />
          <TextField label="Years of Experience" name="yearsOfExperience" type="number" fullWidth value={formData.yearsOfExperience} onChange={handleFormChange} margin="normal" />
          <TextField label="License Number" name="licenseNumber" fullWidth value={formData.licenseNumber} onChange={handleFormChange} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="inherit">Cancel</Button>
          <Button onClick={handleSubmitForm} variant="contained" startIcon={<Add />}>
            {isEditing ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <ImageManagerDialog
        open={imageDialogOpen}
        onClose={() => setImageOpen(false)}
        title={`Images for ${currentVeterinarian?.User?.name || currentVeterinarian?.name || ''}`}
        images={veterinarianImages}
        imageUrlKey="url"
        onUpload={handleAddImage}
        onDelete={handleDeleteImage}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete veterinarian?"
        description={`This will permanently remove ${deleteTarget?.User?.name || 'this veterinarian'}.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteVeterinarian(deleteTarget.id)}
      />

      <Snackbar open={message.open} autoHideDuration={3000} onClose={handleCloseMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseMessage} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </DashboardShell>
  );
};

export default VeterinarianDashboard;
