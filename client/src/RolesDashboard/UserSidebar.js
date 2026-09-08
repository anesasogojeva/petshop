import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography, IconButton, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import PetsIcon from '@mui/icons-material/Pets';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RateReviewIcon from '@mui/icons-material/RateReview';
import NavDrawer from '../components/nav/NavDrawer';

const UserSidebar = ({
  selectedTab,
  setSelectedTab,
  setOpenAddAppointment,
  setOpenAddReview,
  setOpenAddPet,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await axios.post('/api/logout', { refreshToken });
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

  const items = [
    { key: 'adoptions', label: 'Adoptions', icon: PetsIcon, onClick: () => setSelectedTab('adoptions'), active: selectedTab === 'adoptions' },
    { key: 'appointments', label: 'Appointments', icon: EventNoteIcon, onClick: () => setSelectedTab('appointments'), active: selectedTab === 'appointments' },
    { key: 'records', label: 'Records', icon: FolderSharedIcon, onClick: () => setSelectedTab('records'), active: selectedTab === 'records' },
    { key: 'orders', label: 'Orders', icon: ShoppingCartIcon, onClick: () => setSelectedTab('orders'), active: selectedTab === 'orders' },
    { key: 'chat', label: 'Chat', icon: ChatIcon, onClick: () => setSelectedTab('chat'), active: selectedTab === 'chat' },
  ];

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
            My Account
          </Typography>
        }
        actions={
          <>
            <Button fullWidth variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenAddAppointment(true)}>
              Add Appointment
            </Button>
            <Button fullWidth variant="outlined" size="small" startIcon={<RateReviewIcon />} onClick={() => setOpenAddReview(true)}>
              Add Review
            </Button>
            <Button fullWidth variant="outlined" size="small" startIcon={<PetsIcon />} onClick={() => setOpenAddPet(true)}>
              Post Pet for Adoption
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

export default UserSidebar;
