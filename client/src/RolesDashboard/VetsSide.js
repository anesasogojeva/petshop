import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography, IconButton, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NavDrawer from '../components/nav/NavDrawer';

const VetsSide = ({ selectedTab, setSelectedTab, onOpenRecordModal, onOpenSlotModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const isVetRoute = location.pathname.includes('vet');

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await axios.post('http://localhost:5000/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  const items = isVetRoute
    ? [
        { key: 'appointments', label: 'Appointments', icon: EventNoteIcon, onClick: () => setSelectedTab('appointments'), active: selectedTab === 'appointments' },
        { key: 'records', label: 'Records', icon: FolderSharedIcon, onClick: () => setSelectedTab('records'), active: selectedTab === 'records' },
        { key: 'slots', label: 'Available Slots', icon: ScheduleIcon, onClick: () => setSelectedTab('slots'), active: selectedTab === 'slots' },
        { key: 'chat', label: 'Chat', icon: ChatIcon, onClick: () => setSelectedTab('chat'), active: selectedTab === 'chat' },
      ]
    : [{ key: 'appointments', label: 'Appointments', onClick: () => setSelectedTab('appointments'), active: selectedTab === 'appointments' }];

  return (
    <>
      {!isDesktop && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          sx={{
            position: 'fixed',
            top: 12,
            left: 12,
            zIndex: (t) => t.zIndex.drawer + 2,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <NavDrawer
        items={items}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        header={
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            Dashboard
          </Typography>
        }
        actions={
          <>
            <Button fullWidth variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => onOpenRecordModal(true)}>
              Add Record
            </Button>
            <Button fullWidth variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => onOpenSlotModal(true)}>
              Add Slots
            </Button>
          </>
        }
        footer={
          <Button
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="inherit"
            sx={{ justifyContent: 'flex-start' }}
          >
            Logout
          </Button>
        }
      />
    </>
  );
};

export default VetsSide;
