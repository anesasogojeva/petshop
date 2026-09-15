import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, Typography,
} from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { Delete, Edit, Add, NoteAlt } from '@mui/icons-material';
import Sidebar from './Sidebar';
import DashboardShell from './nav/DashboardShell';
import TableToolbar from './shared/TableToolbar';
import EmptyState from './shared/EmptyState';
import ConfirmDialog from './shared/ConfirmDialog';
import ImageManagerDialog from './shared/ImageManagerDialog';
import UnauthorizedState from './shared/UnauthorizedState';
import StatusChip from './shared/StatusChip';
import MobileCardList from './shared/MobileCardList';
import useTableControls from '../hooks/useTableControls';

const PetDashboard = () => {
  const [pets, setPets] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', breed: '', age: '', adopted: false, description: '', gender: '', type: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentPetId, setCurrentPetId] = useState(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState([]);
  const [logNote, setLogNote] = useState('');
  const [logPet, setLogPet] = useState(null);
  const [imageDialogOpen, setImageOpen] = useState(false);
  const [currentPet, setCurrentPet] = useState(null);
  const [petImages, setPetImages] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });
  const showMessage = (text, severity = 'success') => setMessage({ open: true, text, severity });
  const handleCloseMessage = () => setMessage({ ...message, open: false });

  const token = localStorage.getItem('accessToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/pets`, authHeader)
      .then(res => setPets(res.data))
      .catch(err => {
        console.error('Error fetching pets:', err);
        showMessage('Error fetching pets.', 'error');
      });
  }, []);

  const resetForm = () => {
    setFormData({ name: '', breed: '', age: '', adopted: false, description: '', gender: '', type: '' });
    setCurrentPetId(null);
    setIsEditing(false);
  };

  const handleOpenForm = (pet = null) => {
    if (pet) {
      setFormData({
        name: pet.name, breed: pet.breed, age: pet.age, adopted: pet.adopted,
        description: pet.description, gender: pet.gender || '', type: pet.type || '',
      });
      setIsEditing(true);
      setCurrentPetId(pet.id);
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
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmitForm = () => {
    const { adopted, ...dataToSubmit } = formData;
    if (isEditing && currentPetId) {
      axios.put(`${process.env.REACT_APP_API_URL}/api/pets/${currentPetId}`, dataToSubmit, authHeader)
        .then(res => {
          setPets(prev => prev.map(p => p.id === currentPetId ? res.data : p));
          handleCloseForm();
          showMessage('Pet updated successfully.');
        })
        .catch(err => {
          console.error('Error updating pet:', err);
          showMessage('Error updating pet.', 'error');
        });
    } else {
      axios.post(`${process.env.REACT_APP_API_URL}/api/pets`, formData, authHeader)
        .then(res => {
          setPets(prev => [...prev, res.data]);
          handleCloseForm();
          showMessage('Pet added successfully.');
        })
        .catch(err => {
          console.error('Error adding pet:', err);
          showMessage('Error adding pet.', 'error');
        });
    }
  };

  const handleDeletePet = (id) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/pets/${id}`, authHeader)
      .then(() => {
        setPets(prev => prev.filter(p => p.id !== id));
        showMessage('Pet deleted successfully.');
      })
      .catch(err => {
        console.error('Error deleting pet:', err);
        showMessage('Error deleting pet.', 'error');
      })
      .finally(() => setDeleteTarget(null));
  };

  const handleOpenLogs = (pet) => {
    setLogPet(pet);
    axios.get(`${process.env.REACT_APP_API_URL}/api/pet-logs/${pet.id}`)
      .then(res => {
        setCurrentLogs(res.data.logs || []);
        setLogDialogOpen(true);
      })
      .catch(err => {
        console.error('Error fetching logs:', err);
        setCurrentLogs([]);
        setLogDialogOpen(true);
        showMessage('Error fetching logs.', 'error');
      });
  };

  const fetchPetImages = async (petId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/pets/${petId}/image`);
      setPetImages(res.data.images || []);
    } catch (err) {
      console.error('Error fetching images:', err);
      showMessage('Error fetching images.', 'error');
    }
  };

  const handleOpenImages = (pet) => {
    setCurrentPet(pet);
    setPetImages(null);
    setImageOpen(true);
    fetchPetImages(pet.id);
  };

  const handleAddLog = () => {
    if (!logPet?.id) return;
    axios.post(`${process.env.REACT_APP_API_URL}/api/pet-logs/${logPet.id}`, { petId: logPet.id, note: logNote })
      .then(res => {
        setCurrentLogs(res.data.logs);
        setLogNote('');
        showMessage('Log added successfully.');
      })
      .catch(err => {
        console.error('Error adding log:', err);
        showMessage('Error adding log.', 'error');
      });
  };

  const handleAddImage = async (imageFile) => {
    if (!currentPet?.id || !imageFile) return;
    const formDataUpload = new FormData();
    formDataUpload.append('image', imageFile);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/pets/${currentPet.id}/image`, formDataUpload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPetImages(currentPet.id);
      showMessage('Image uploaded successfully.');
    } catch (err) {
      console.error('Error uploading image:', err);
      showMessage('Error uploading image.', 'error');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!currentPet?.id || !imageId) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/pets/${currentPet.id}/image/${imageId}`);
      await fetchPetImages(currentPet.id);
      showMessage('Image deleted successfully.');
    } catch (err) {
      console.error('Error deleting image:', err);
      showMessage('Error deleting image.', 'error');
    }
  };

  const { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage, pageRows, filteredCount } =
    useTableControls(pets, { searchKeys: ['name', 'breed', 'type'] });

  const userRole = localStorage.getItem('role');
  if (userRole !== 'admin') return <UnauthorizedState />;

  return (
    <DashboardShell title="Pets" roleLabel="Admin" nav={<Sidebar />}>
      <TableToolbar
        title="Pets"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, breed, type..."
        addLabel="Add Pet"
        onAdd={() => handleOpenForm()}
      />

      <MobileCardList
        rows={pageRows}
        emptyTitle="No pets found"
        emptyDescription="Add a pet to get started."
        pagination={{
          count: filteredCount,
          page,
          onPageChange: (_, p) => setPage(p),
          rowsPerPage,
          onRowsPerPageChange: (e) => setRowsPerPage(Number(e.target.value)),
          rowsPerPageOptions: [5, 10, 25],
        }}
        renderCard={(pet) => (
          <Paper key={pet.id} variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">{pet.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {pet.breed} · {pet.age} yrs · {pet.gender} · {pet.type}
                </Typography>
              </Box>
              {pet.adopted
                ? <StatusChip status="booked" label="Adopted" />
                : <StatusChip status="available" label="Available" />}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton onClick={() => handleOpenImages(pet)} aria-label="Manage images" size="small">
                <PhotoLibraryIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => handleOpenForm(pet)} aria-label="Edit" size="small">
                <Edit fontSize="small" />
              </IconButton>
              <IconButton onClick={() => setDeleteTarget(pet)} aria-label="Delete" size="small">
                <Delete fontSize="small" />
              </IconButton>
              <IconButton onClick={() => handleOpenLogs(pet)} aria-label="Logs" size="small">
                <NoteAlt fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        )}
      />

      <TableContainer component={Paper} sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Breed</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Adopted</TableCell>
              <TableCell>Images</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState title="No pets found" description="Add a pet to get started." />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((pet) => (
                <TableRow key={pet.id} hover>
                  <TableCell>{pet.name}</TableCell>
                  <TableCell>{pet.breed}</TableCell>
                  <TableCell>{pet.age}</TableCell>
                  <TableCell>{pet.gender}</TableCell>
                  <TableCell>{pet.type}</TableCell>
                  <TableCell>
                    {pet.adopted
                      ? <StatusChip status="booked" label="Adopted" />
                      : <StatusChip status="available" label="Available" />}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenImages(pet)} aria-label="Manage images">
                      <PhotoLibraryIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenForm(pet)} aria-label="Edit">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => setDeleteTarget(pet)} aria-label="Delete">
                      <Delete fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleOpenLogs(pet)} aria-label="Logs">
                      <NoteAlt fontSize="small" />
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
        <DialogTitle>{isEditing ? 'Edit Pet' : 'Add New Pet'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" name="name" fullWidth value={formData.name} onChange={handleFormChange} margin="normal" />
          <TextField label="Breed" name="breed" fullWidth value={formData.breed} onChange={handleFormChange} margin="normal" />
          <TextField label="Age" name="age" type="number" fullWidth value={formData.age} onChange={handleFormChange} margin="normal" />

          <FormControl fullWidth margin="normal">
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select labelId="gender-label" name="gender" value={formData.gender} label="Gender" onChange={handleFormChange}>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="type-label">Type</InputLabel>
            <Select labelId="type-label" name="type" value={formData.type} label="Type" onChange={handleFormChange}>
              <MenuItem value="Dog">Dog</MenuItem>
              <MenuItem value="Cat">Cat</MenuItem>
              <MenuItem value="Bird">Bird</MenuItem>
              <MenuItem value="Turtle">Turtle</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField label="Description" name="description" fullWidth value={formData.description} onChange={handleFormChange} margin="normal" multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="inherit">Cancel</Button>
          <Button onClick={handleSubmitForm} variant="contained" startIcon={<Add />}>
            {isEditing ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={logDialogOpen} onClose={() => setLogDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Logs for {logPet?.name}</DialogTitle>
        <DialogContent>
          {currentLogs.length === 0 ? (
            <EmptyState compact title="No logs yet" />
          ) : (
            currentLogs.map((log, index) => (
              <Box key={index} sx={{ mb: 1, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2"><strong>Note:</strong> {log.note}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(log.date).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
          <TextField
            label="Add New Note"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={logNote}
            onChange={(e) => setLogNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDialogOpen(false)} color="inherit">Close</Button>
          <Button onClick={handleAddLog} disabled={!logNote} variant="contained">Add Log</Button>
        </DialogActions>
      </Dialog>

      <ImageManagerDialog
        open={imageDialogOpen}
        onClose={() => setImageOpen(false)}
        title={`Images for ${currentPet?.name || ''}`}
        images={petImages}
        imageUrlKey="imageUrl"
        onUpload={handleAddImage}
        onDelete={handleDeleteImage}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete pet?"
        description={`This will permanently remove ${deleteTarget?.name || 'this pet'}.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDeletePet(deleteTarget.id)}
      />

      <Snackbar open={message.open} autoHideDuration={3000} onClose={handleCloseMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseMessage} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </DashboardShell>
  );
};

export default PetDashboard;
