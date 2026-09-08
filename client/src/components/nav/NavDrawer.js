import React from 'react';
import {
  Drawer,
  Toolbar,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { drawerWidth } from '../../theme/tokens';

/**
 * Shared, purely presentational navigation drawer.
 *
 * Consumed by components/Sidebar.js (admin, route-based),
 * RolesDashboard/UserSidebar.js and RolesDashboard/VetsSide.js
 * (tab-based) — each call site keeps its own item list / callbacks,
 * this component only owns the visual chrome and responsive behavior.
 *
 * items: [{ key, label, icon: Icon, onClick, active }]
 * actions: optional extra content rendered below the main list
 *   (e.g. "Add Appointment" / "Add Record" buttons owned by the parent page)
 * footer: optional content pinned to the bottom (e.g. logout)
 */
const NavDrawer = ({
  items = [],
  actions = null,
  header = null,
  footer = null,
  mobileOpen = false,
  onMobileClose = () => {},
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2 }}>{header}</Toolbar>
      <Divider />

      <List sx={{ flexGrow: 1, py: 1, px: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.key || item.label}
            selected={!!item.active}
            onClick={() => {
              item.onClick?.();
              if (!isDesktop) onMobileClose();
            }}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              color: 'text.primary',
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                color: 'primary.dark',
                '& .MuiListItemIcon-root': { color: 'primary.dark' },
                '&:hover': { bgcolor: 'primary.light' },
              },
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {item.icon && (
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                <item.icon fontSize="small" />
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: item.active ? 700 : 500 }}
            />
          </ListItemButton>
        ))}

        {actions && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ px: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>{actions}</Box>
          </>
        )}
      </List>

      {footer && (
        <Box>
          <Divider />
          <Box sx={{ p: 1 }}>{footer}</Box>
        </Box>
      )}
    </Box>
  );

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      {content}
    </Drawer>
  );
};

export default NavDrawer;
