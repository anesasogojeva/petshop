import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { NavLink, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import '../CSS/Header.css';
import Logo from '../images/logomain.png';

const getUserInfoFromToken = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const userInfo = getUserInfoFromToken();
    setUser(userInfo);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setMenuOpen(false);
    navigate('/login');
  };

  const getDashboardUrl = (role) => {
    switch (role) {
      case 'admin': return '/adoption';
      case 'veterinarian': return '/vetsDash';
      case 'user': return '/user';
      default: return '/';
    }
  };

  const dashboardUrl = user ? getDashboardUrl(user.role) : null;

  return (
    <header className="main-header">
      <div className="logo">
        <img src={Logo} alt="Pawtopia Logo" className="logo-icon" />
        <span>Pawtopia</span>
      </div>

      <IconButton
        className="menu-toggle"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#fff' }}
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <nav className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
        <NavLink to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/aboutus" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</NavLink>
        <NavLink to="/adopt" className="nav-link" onClick={() => setMenuOpen(false)}>Adopt</NavLink>
        <NavLink to="/productList" className="nav-link" onClick={() => setMenuOpen(false)}>Shop</NavLink>
        <NavLink to="/shelters" className="nav-link" onClick={() => setMenuOpen(false)}>Shelters</NavLink>

        {user && dashboardUrl ? (
          <NavLink to={dashboardUrl} className="nav-link dashboard-link" onClick={() => setMenuOpen(false)}>
            Dashboard
          </NavLink>
        ) : null}

        {user ? (
          <button type="button" onClick={handleLogout} className="nav-link login-link">
            Logout
          </button>
        ) : (
          <NavLink to="/login" className="nav-link login-link" onClick={() => setMenuOpen(false)}>
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
};

export default Header;
