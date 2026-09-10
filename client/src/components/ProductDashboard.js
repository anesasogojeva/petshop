import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, Typography,
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

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({ name: '', description: '', price: '', discount: '', category: '' });

  const [imageDialogOpen, setImageOpen] = useState(false);
  const [currentProduct, setCurrentProd] = useState(null);
  const [productImages, setProductImages] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const token = localStorage.getItem('accessToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });
  const showMessage = (text, severity = 'success') => setMessage({ open: true, text, severity });
  const handleCloseMessage = () => setMessage({ ...message, open: false });

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/products`, authHeader)
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error('Error fetching products:', err);
        showMessage('Error fetching products.', 'error');
      });
  }, []);

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', discount: '', category: '' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleOpenForm = (product = null) => {
    if (product) {
      setFormData({
        name: product.name, description: product.description, price: product.price,
        discount: product.discount, category: product.category,
      });
      setIsEditing(true);
      setCurrentId(product.id);
    } else {
      resetForm();
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    resetForm();
  };

  const handleFormChange = ({ target: { name, value } }) =>
    setFormData(prev => ({ ...prev, [name]: ['price', 'discount'].includes(name) ? Number(value) : value }));

  const handleSubmitForm = () => {
    const { name, description, price, discount, category } = formData;
    if (!name || !description || price === '' || discount === '' || !category) {
      showMessage('All fields are required.', 'error');
      return;
    }

    if (isEditing && currentProductId) {
      axios.put(`${process.env.REACT_APP_API_URL}/api/products/${currentProductId}`, formData, authHeader)
        .then(res => {
          setProducts(prev => prev.map(p => (p.id === currentProductId ? res.data : p)));
          handleCloseForm();
          showMessage('Product updated successfully.');
        })
        .catch(err => {
          console.error('Error updating product:', err);
          showMessage('Error updating product.', 'error');
        });
    } else {
      axios.post(`${process.env.REACT_APP_API_URL}/api/products`, formData, authHeader)
        .then(res => {
          setProducts(prev => [...prev, res.data]);
          handleCloseForm();
          showMessage('Product added successfully.');
        })
        .catch(err => {
          console.error('Error adding product:', err);
          showMessage('Error adding product.', 'error');
        });
    }
  };

  const handleDeleteProduct = (id) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${id}`, authHeader)
      .then(() => {
        setProducts(prev => prev.filter(p => p.id !== id));
        showMessage('Product deleted successfully.', 'success');
      })
      .catch(err => {
        console.error('Error deleting product:', err);
        showMessage('Failed to delete the product.', 'error');
      })
      .finally(() => setDeleteTarget(null));
  };

  const fetchProductImages = async (productId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${productId}/image`);
      setProductImages(res.data.images || []);
    } catch (err) {
      console.error('Error fetching product images:', err);
      showMessage('Error fetching images.', 'error');
    }
  };

  const handleOpenImages = (product) => {
    setCurrentProd(product);
    setProductImages(null);
    setImageOpen(true);
    fetchProductImages(product.id);
  };

  const handleAddImage = async (imageFile) => {
    if (!currentProduct?.id || !imageFile) return;
    const formDataUpload = new FormData();
    formDataUpload.append('image', imageFile);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/products/${currentProduct.id}/image`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchProductImages(currentProduct.id);
      showMessage('Image uploaded successfully.');
    } catch (err) {
      console.error('Error uploading image:', err);
      showMessage('Error uploading image.', 'error');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!currentProduct?.id || !imageId) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${currentProduct.id}/image/${imageId}`);
      await fetchProductImages(currentProduct.id);
      showMessage('Image deleted successfully.');
    } catch (err) {
      console.error('Error deleting image:', err);
      showMessage('Error deleting image.', 'error');
    }
  };

  const { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage, pageRows, filteredCount } =
    useTableControls(products, { searchKeys: ['name', 'category', 'description'] });

  const userRole = localStorage.getItem('role');
  if (userRole !== 'admin') return <UnauthorizedState />;

  return (
    <DashboardShell title="Products" roleLabel="Admin" nav={<Sidebar />}>
      <TableToolbar
        title="Products"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, category..."
        addLabel="Add Product"
        onAdd={() => handleOpenForm()}
      />

      <MobileCardList
        rows={pageRows}
        emptyTitle="No products found"
        emptyDescription="Add a product to get started."
        pagination={{
          count: filteredCount,
          page,
          onPageChange: (_, p) => setPage(p),
          rowsPerPage,
          onRowsPerPageChange: (e) => setRowsPerPage(Number(e.target.value)),
          rowsPerPageOptions: [5, 10, 25],
        }}
        renderCard={(product) => (
          <Paper key={product.id} variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">{product.category}</Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleOpenImages(product)} aria-label="Manage images" size="small">
                  <PhotoLibraryIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => handleOpenForm(product)} aria-label="Edit" size="small">
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton onClick={() => setDeleteTarget(product)} aria-label="Delete" size="small">
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>{product.description}</Typography>
            <Typography variant="body2">
              <Box component="s" sx={{ color: 'text.disabled', mr: 0.5 }}>${Number(product.price).toFixed(2)}</Box>
              <strong>${Number(product.price * (1 - product.discount)).toFixed(2)}</strong>
              {' '}({product.discount * 100}% off)
            </Typography>
          </Paper>
        )}
      />

      <TableContainer component={Paper} sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Images</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="No products found" description="Add a product to get started." />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map(product => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>
                    <Box component="s" sx={{ color: 'text.disabled', mr: 0.5 }}>${Number(product.price).toFixed(2)}</Box>
                    ${Number(product.price * (1 - product.discount)).toFixed(2)}
                  </TableCell>
                  <TableCell>{product.discount * 100}%</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenImages(product)} aria-label="Manage images">
                      <PhotoLibraryIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenForm(product)} aria-label="Edit"><Edit fontSize="small" /></IconButton>
                    <IconButton onClick={() => setDeleteTarget(product)} aria-label="Delete"><Delete fontSize="small" /></IconButton>
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
        <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" name="name" fullWidth margin="normal" value={formData.name} onChange={handleFormChange} />
          <TextField label="Description" name="description" fullWidth margin="normal" value={formData.description} onChange={handleFormChange} />
          <TextField label="Price" name="price" type="number" fullWidth margin="normal" value={formData.price} onChange={handleFormChange} />
          <TextField
            label="Discount" name="discount" type="number" fullWidth margin="normal"
            inputProps={{ min: 0, max: 1, step: 0.01 }} value={formData.discount} onChange={handleFormChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select name="category" label="Category" value={formData.category} onChange={handleFormChange}>
              <MenuItem value="pet food">Pet Food</MenuItem>
              <MenuItem value="toys">Toys</MenuItem>
              <MenuItem value="clothes">Clothes</MenuItem>
            </Select>
          </FormControl>
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
        title={`Images for ${currentProduct?.name || ''}`}
        images={productImages}
        imageUrlKey="url"
        onUpload={handleAddImage}
        onDelete={handleDeleteImage}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product?"
        description={`This will permanently remove ${deleteTarget?.name || 'this product'}.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteProduct(deleteTarget.id)}
      />

      <Snackbar open={message.open} autoHideDuration={3000} onClose={handleCloseMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseMessage} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </DashboardShell>
  );
};

export default ProductDashboard;
