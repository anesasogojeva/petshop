import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography, IconButton, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DescriptionIcon from '@mui/icons-material/Description';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RateReviewIcon from '@mui/icons-material/RateReview';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import NavDrawer from './nav/NavDrawer';
import { getCurrentRole } from '../utils/auth';

// Admin navigation — this Sidebar is only rendered on the 10 admin CRUD
// pages (each page already gates non-admins out before rendering it),
// role is read here too so the menu itself never lists admin-only
// destinations for anyone else.
const ADMIN_NAV_ITEMS = [
  { key: 'pets', label: 'Pets', icon: PetsIcon, link: '/petDashboard' },
  { key: 'users', label: 'Users', icon: PeopleIcon, link: '/users' },
  { key: 'appointments', label: 'Appointments', icon: CalendarTodayIcon, link: '/appointment' },
  { key: 'adoptions', label: 'Adoptions', icon: FavoriteIcon, link: '/adoption' },
  { key: 'veterinarians', label: 'Veterinarians', icon: LocalHospitalIcon, link: '/vets' },
  { key: 'records', label: 'Records', icon: DescriptionIcon, link: '/records' },
  { key: 'products', label: 'Products', icon: StorefrontIcon, link: '/product' },
  { key: 'orders', label: 'Orders', icon: ListAltIcon, link: '/order' },
  { key: 'reviews', label: 'Reviews', icon: RateReviewIcon, link: '/reviews' },
  { key: 'contact', label: 'Contact Requests', icon: MailOutlineIcon, link: '/contactDash' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = getCurrentRole();

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

  const items = (role === 'admin' ? ADMIN_NAV_ITEMS : []).map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    active: location.pathname.toLowerCase() === item.link.toLowerCase(),
    onClick: () => navigate(item.link),
  }));

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
          <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'primary.main' }}>
            Pawtopia Admin
          </Typography>
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

export default Sidebar;
