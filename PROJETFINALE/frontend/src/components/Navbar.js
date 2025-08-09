import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
  Drawer
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  Logout,
  Close
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    handleClose();
    if (user?.role === 'client') {
      navigate('/dashboard-client');
    } else if (user?.role === 'stylist') {
      navigate('/dashboard-coiffeuse');
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  const handleLogoutClick = () => {
    handleClose();
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'À Propos', path: '/a-propos' },
    { label: 'Équipe', path: '/equipe' },
    { label: 'Formulaire Nouveaux Clients', path: '/register' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Prendre Rendez-Vous', path: '/rendez-vous' }
  ];

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        className="navbar-glass animate-navbar-fade"
        sx={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(212, 185, 150, 0.2)',
          borderRadius: '0 0 2.2rem 2.2rem',
          boxShadow: '0 8px 32px 0 rgba(176, 137, 104, 0.13), 0 2px 8px rgba(176, 137, 104, 0.08)',
        }}
      >
        <Toolbar sx={{ 
          padding: { xs: '0.8rem 1.5rem', sm: '1.1rem 2.7rem' },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: { xs: '0.5rem', sm: '1rem' },
          minHeight: { xs: '64px', sm: '72px' }
        }}>
          {/* Left side - Hamburger and Logo */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: '0.5rem', sm: '1rem' },
            flex: '0 0 auto'
          }}>
            {/* Hamburger Menu Button - always visible */}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ 
                color: '#B78C68',
                padding: { xs: '0.5rem', sm: '0.75rem' },
                '&:hover': {
                  color: '#8B5E34',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Typography
              variant="h4"
              component={Link}
              to="/"
              className="navbar-title"
              sx={{
                textDecoration: 'none',
                color: '#7f5539',
                fontWeight: 700,
                fontSize: { xs: '1.2rem', sm: '1.55rem' },
                letterSpacing: '1.5px',
                fontFamily: '"Montserrat", Arial, sans-serif',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.08) rotate(-4deg)',
                  filter: 'drop-shadow(0 2px 8px #e3caa5)',
                }
              }}
            >
              She
            </Typography>
          </Box>

          {/* Right side - User Menu or Auth Buttons */}
          {user ? (
            <Box className="navbar-menu-premium" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: '0.5rem', sm: '0.8rem' },
              flex: '0 0 auto',
              flexWrap: { xs: 'wrap', sm: 'nowrap' }
            }}>
              <Typography className="navbar-user-premium" sx={{ 
                color: '#7f5539', 
                fontWeight: 600, 
                fontSize: { xs: '0.9rem', sm: '1.08rem' }
              }}>
                {user.firstName || user.email}
              </Typography>
              <Button
                className="navbar-btn-premium"
                onClick={handleDashboardClick}
                sx={{
                  background: 'linear-gradient(90deg, #a67c52 0%, #e3caa5 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '16px',
                  padding: { xs: '6px 16px', sm: '9px 22px' },
                  fontSize: { xs: '0.9rem', sm: '1.08rem' },
                  boxShadow: '0 2px 8px rgba(166, 124, 82, 0.10)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #e57373 0%, #a67c52 100%)',
                    color: '#fff8f0',
                    transform: 'translateY(-2px) scale(1.04)',
                    boxShadow: '0 8px 32px rgba(166, 124, 82, 0.18)',
                  }
                }}
              >
                {user.role === 'client' ? 'Dashboard Client' : 
                 user.role === 'stylist' ? 'Dashboard Coiffeuse' : 
                 user.role === 'admin' ? 'Dashboard Admin' : 'Dashboard'}
              </Button>
              <Button
                className="navbar-logout-premium"
                onClick={handleLogoutClick}
                sx={{
                  background: 'none',
                  color: '#e57373',
                  border: '2px solid #e57373',
                  padding: { xs: '6px 16px', sm: '8px 20px' },
                  fontWeight: 700,
                  borderRadius: '16px',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: '#fff8f0',
                    color: '#a67c52',
                    border: '2px solid #a67c52',
                  }
                }}
              >
                Déconnexion
              </Button>
            </Box>
          ) : (
            <Box className="navbar-menu-premium" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: '0.5rem', sm: '1rem' },
              flex: '0 0 auto'
            }}>
              <Button
                className="navbar-link-premium"
                onClick={() => navigate('/login')}
                sx={{
                  color: '#a67c52',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1.08rem' },
                  padding: { xs: '6px 14px', sm: '7px 18px' },
                  borderRadius: '14px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: '#fff8f0',
                    color: '#e57373',
                    boxShadow: '0 2px 8px #e3caa5',
                  }
                }}
              >
                Connexion
              </Button>
              <Button
                className="navbar-btn-premium"
                onClick={() => navigate('/register')}
                sx={{
                  background: 'linear-gradient(90deg, #a67c52 0%, #e3caa5 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '16px',
                  padding: { xs: '6px 16px', sm: '9px 22px' },
                  fontSize: { xs: '0.9rem', sm: '1.08rem' },
                  boxShadow: '0 2px 8px rgba(166, 124, 82, 0.10)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #e57373 0%, #a67c52 100%)',
                    color: '#fff8f0',
                    transform: 'translateY(-2px) scale(1.04)',
                    boxShadow: '0 8px 32px rgba(166, 124, 82, 0.18)',
                  }
                }}
              >
                Inscription
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Slide-out Sidebar */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        ModalProps={{
          BackdropProps: {
            sx: { backgroundColor: 'rgba(44, 44, 44, 0.4)' }
          }
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '95vw', sm: '450px' },
            height: '100vh',
            background: 'linear-gradient(180deg, #FDFCFA 0%, #F8F6F2 100%)',
            borderRight: '1px solid rgba(212, 185, 150, 0.3)',
            boxShadow: '4px 0 20px rgba(44, 44, 44, 0.12)',
          }
        }}
      >
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header with MENU title and close button */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 20px',
            borderBottom: '1px solid rgba(212, 185, 150, 0.2)',
            background: 'linear-gradient(135deg, #D4B996 0%, #E8D5C4 100%)',
          }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#2C2C2C',
                letterSpacing: '3px',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontSize: '1.1rem'
              }}
            >
              MENU
            </Typography>
            <IconButton
              onClick={handleMobileMenuClose}
              sx={{
                color: '#2C2C2C',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  transform: 'scale(1.1)',
                  boxShadow: '0px 4px 12px rgba(44, 44, 44, 0.15)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ flex: 1, padding: '16px 0' }}>
            {menuItems.map((item, index) => (
              <Box
                key={item.path}
                onClick={() => handleMenuItemClick(item.path)}
                className="menu-item"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderRadius: '0 25px 25px 0',
                  margin: '4px 0 4px 16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(212, 185, 150, 0.15)',
                    transform: 'translateX(8px)',
                    boxShadow: '0px 4px 12px rgba(212, 185, 150, 0.3)',
                    '&::before': {
                      width: '4px'
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '0px',
                    height: '60%',
                    backgroundColor: '#D4B996',
                    borderRadius: '0 4px 4px 0',
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }
                }}
              >
                <Typography
                  sx={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#2C2C2C',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '0.5px',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
            
            {/* Decorative element at bottom */}
            <Box sx={{
              marginTop: 'auto',
              padding: '20px',
              textAlign: 'center'
            }}>
              <Box sx={{
                width: '60px',
                height: '2px',
                background: 'linear-gradient(90deg, #D4B996, #B8A08A)',
                margin: '0 auto',
                borderRadius: '1px'
              }} />
              <Typography sx={{
                fontSize: '12px',
                color: '#6B6B6B',
                marginTop: '12px',
                fontWeight: 500,
                letterSpacing: '1px'
              }}>
                She Salon
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;