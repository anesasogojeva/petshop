import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import PetsIcon from '@mui/icons-material/Pets';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RateReviewIcon from '@mui/icons-material/RateReview';
import NavDrawer from '../components/nav/NavDrawer';

// The mobile "open menu" button lives in UserDash's own AppBar Toolbar
// (in normal flex flow, next to the title) rather than floating here, so it
// can never visually overlap the title — this component just owns the
// drawer's contents and is opened/closed by the parent via `mobileOpen`.
const UserSidebar = ({
  selectedTab,
  setSelectedTab,
  setOpenAddAppointment,
  setOpenAddReview,
  setOpenAddPet,
  mobileOpen = false,
  onMobileClose = () => {},
}) => {
  const navigate = useNavigate();

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
    <NavDrawer
      items={items}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
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
  );
};

export default UserSidebar;
