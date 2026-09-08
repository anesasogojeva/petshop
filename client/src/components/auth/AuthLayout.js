import React from 'react';
import { Box, Paper, Stack } from '@mui/material';
import sideImage from '../../images/image1.png';
import logo from '../../images/logoLart.png';

/**
 * Shared split-screen shell for every auth page (Login, Register,
 * ChangePassword, ResetPassword) so they all read as one consistent,
 * on-brand family instead of each re-implementing the same layout.
 */
const AuthLayout = ({ title, subtitle, children, footer }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.light',
        }}
      >
        <Box component="img" src={sideImage} alt="" sx={{ width: '60%', maxWidth: 420 }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 5 },
        }}
      >
        <Paper
          variant="outlined"
          sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 } }}
        >
          <Stack spacing={0.5} alignItems="center" sx={{ mb: 3 }}>
            <Box component="img" src={logo} alt="Pawtopia" sx={{ width: 44, height: 44, mb: 1 }} />
            <Box sx={{ typography: 'h5', textAlign: 'center' }}>{title}</Box>
            {subtitle && (
              <Box sx={{ typography: 'body2', color: 'text.secondary', textAlign: 'center' }}>
                {subtitle}
              </Box>
            )}
          </Stack>

          {children}

          {footer && (
            <Box sx={{ mt: 3, textAlign: 'center', typography: 'body2' }}>{footer}</Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AuthLayout;
