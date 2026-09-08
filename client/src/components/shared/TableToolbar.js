import React from 'react';
import { Box, Typography, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

/**
 * Consistent header bar for admin tables: title + search + optional
 * "Add" action. Purely presentational — search state is owned by the
 * caller (see hooks/useTableControls.js).
 */
const TableToolbar = ({
  title,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  addLabel,
  onAdd,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mb: 2,
      }}
    >
      {title && (
        <Typography variant="h5" sx={{ mr: 'auto' }}>
          {title}
        </Typography>
      )}

      {onSearchChange && (
        <TextField
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          size="small"
          sx={{ minWidth: 240 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      )}

      {addLabel && onAdd && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
          {addLabel}
        </Button>
      )}
    </Box>
  );
};

export default TableToolbar;
