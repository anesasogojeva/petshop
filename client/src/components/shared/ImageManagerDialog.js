import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EmptyState from './EmptyState';

/**
 * Shared upload/list/delete image manager, used by the Veterinarian,
 * Product and Pet admin dashboards (previously three separate,
 * near-identical copy-pasted implementations of the same REST shape).
 *
 * images: array of image objects (or null while loading), each read via
 *   the `imageUrlKey` prop since entities store it under different keys
 *   (vets/products use `url`, pets use `imageUrl`).
 */
const ImageManagerDialog = ({
  open,
  onClose,
  title,
  images,
  imageUrlKey = 'url',
  onUpload,
  onDelete,
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {images === null ? (
          <Typography color="text.secondary">Loading images...</Typography>
        ) : images.length === 0 ? (
          <EmptyState
            compact
            icon={PhotoLibraryIcon}
            title="No images yet"
            description="Upload a photo below."
          />
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {images.map((img) => (
              <Box key={img.id || img._id} sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={`http://localhost:5000/${img[imageUrlKey]}`}
                  alt=""
                  sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                />
                <IconButton
                  size="small"
                  onClick={() => onDelete(img._id)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <input
            accept="image/*"
            id="image-manager-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
          <label htmlFor="image-manager-upload">
            <Button variant="outlined" component="span" startIcon={<PhotoLibraryIcon />}>
              Choose File
            </Button>
          </label>
          {file && (
            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 160 }}>
              {file.name}
            </Typography>
          )}
          <Button variant="contained" onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageManagerDialog;
