import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Chip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { drawerWidth } from '../../theme/tokens';

/**
 * Shared page shell for the admin CRUD pages: a clean AppBar (title +
 * optional role chip) + whatever nav drawer is passed in + a content slot.
 * Adopted by the 10 admin dashboard pages in place of each page's own
 * hand-rolled AppBar/Sidebar/Box boilerplate.
 */
const DashboardShell = ({ title, roleLabel, nav, children }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: isDesktop ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: isDesktop ? `${drawerWidth}px` : 0,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!isDesktop && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap>
              {title}
            </Typography>
          </Box>
          {roleLabel && <Chip label={roleLabel} size="small" color="primary" variant="outlined" />}
        </Toolbar>
      </AppBar>

      {typeof nav === 'function' ? nav({ mobileOpen, onMobileClose: () => setMobileOpen(false) }) : nav}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, sm: 3 },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardShell;
