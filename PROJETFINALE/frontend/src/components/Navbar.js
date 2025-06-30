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
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          {/* Hamburger Menu Button - always visible */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMobileMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Typography
            variant="h4"
            component={Link}
            to="/"
            sx={{
              flexGrow: 0,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              mr: 4
            }}
          >
            She
          </Typography>

          {/* Flex Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* User Menu or Auth Buttons on the far right */}
          {user ? (
            <Box>
              <Tooltip title="User menu">
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user.firstName?.charAt(0) || user.email?.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleDashboardClick}>
                  <ListItemIcon>
                    <Dashboard fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    {user.role === 'client' ? 'Dashboard Client' : 
                     user.role === 'stylist' ? 'Dashboard Coiffeuse' : 
                     user.role === 'admin' ? 'Dashboard Admin' : 'Dashboard'}
                  </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogoutClick}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Déconnexion</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                variant="outlined"
                sx={{ 
                  borderColor: 'inherit',
                  '&:hover': {
                    borderColor: 'inherit',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                Connexion
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/register')}
                variant="contained"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)'
                  }
                }}
              >
                Inscription
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Slide-out Sidebar - now always visible */}
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