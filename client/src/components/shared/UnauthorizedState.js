import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Consistent "you can't be here" screen, replacing the ~10 duplicated
 * plain unstyled "Unauthorized" divs across the admin pages.
 * Same links/behavior as before: go home or go sign in.
 */
const UnauthorizedState = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <LockOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        You don't have access to this page
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360 }}>
        Your account doesn't have permission to view this section.
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button component={RouterLink} to="/" variant="outlined">
          Go to homepage
        </Button>
        <Button component={RouterLink} to="/login" variant="contained">
          Sign in
        </Button>
      </Stack>
    </Box>
  );
};

export default UnauthorizedState;
