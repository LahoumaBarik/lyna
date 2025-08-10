import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Drawer,
  Fade,
  Slide,
  Badge,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  Logout,
  Close,
  Person,
  CalendarToday,
  Settings,
  Notifications,
  Home,
  ContentCut,
  Info,
  People,
  Help,
  PersonAdd
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { label: 'Accueil', path: '/', icon: <Home sx={{ fontSize: 20 }} /> },
    { label: 'Services', path: '/services', icon: <ContentCut sx={{ fontSize: 20 }} /> },
    { label: 'À Propos', path: '/a-propos', icon: <Info sx={{ fontSize: 20 }} /> },
    { label: 'Équipe', path: '/equipe', icon: <People sx={{ fontSize: 20 }} /> },
    { label: 'Nouveaux Clients', path: '/register', icon: <PersonAdd sx={{ fontSize: 20 }} />, highlight: true },
    { label: 'FAQ', path: '/faq', icon: <Help sx={{ fontSize: 20 }} /> },
    { label: 'Réserver', path: '/rendez-vous', icon: <CalendarToday sx={{ fontSize: 20 }} />, primary: true }
  ];

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  return (
    <>
      {/* Modern AppBar with Glass Effect */}
      <Slide direction="down" in timeout={500}>
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            background: scrolled 
              ? 'rgba(255, 255, 255, 0.95)' 
              : location.pathname === '/' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: scrolled || location.pathname !== '/' 
              ? '1px solid rgba(139, 115, 85, 0.1)' 
              : '1px solid rgba(255, 255, 255, 0.1)',
            color: location.pathname === '/' && !scrolled ? 'white' : '#2C2C2C',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none'
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            {/* Modern Hamburger Menu */}
            <IconButton
              edge="start"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ 
                mr: 3,
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'rgba(139, 115, 85, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(139, 115, 85, 0.2)',
                color: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'rgba(139, 115, 85, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(139, 115, 85, 0.2)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Modern Logo */}
            <Typography
              variant="h4"
              component={Link}
              to="/"
              sx={{
                flexGrow: 0,
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                fontSize: '2rem',
                fontFamily: 'Playfair Display, serif',
                fontStyle: 'italic',
                mr: 4,
                background: location.pathname === '/' && !scrolled 
                  ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)'
                  : 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              She
            </Typography>

            {/* Flex Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop Navigation (Hidden on Mobile) */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 1, mr: 3 }}>
              {menuItems.slice(0, -2).map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: 'inherit',
                    fontWeight: 500,
                    textTransform: 'none',
                    px: 2,
                    py: 1,
                    borderRadius: '12px',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      width: location.pathname === item.path ? '80%' : '0%',
                      height: '2px',
                      background: 'linear-gradient(135deg, #8B7355, #D4AF37)',
                      transform: 'translateX(-50%)',
                      transition: 'width 0.3s ease',
                      borderRadius: '1px'
                    },
                    '&:hover': {
                      background: 'rgba(139, 115, 85, 0.1)',
                      '&::after': {
                        width: '80%'
                      }
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                

                {/* User Avatar Menu */}
                <Tooltip title="Menu utilisateur" arrow>
                  <IconButton
                    size="large"
                    aria-label="compte utilisateur"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    sx={{
                      p: 0.5,
                      borderRadius: '12px',
                      background: 'rgba(139, 115, 85, 0.1)',
                      border: '2px solid rgba(139, 115, 85, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(139, 115, 85, 0.2)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(139, 115, 85, 0.2)'
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      {user.firstName?.charAt(0) || user.email?.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                {/* Modern User Menu */}
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  sx={{
                    '& .MuiPaper-root': {
                      borderRadius: '16px',
                      mt: 1,
                      minWidth: 220,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(139, 115, 85, 0.1)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                >
                  {/* User Info Header */}
                  <Box sx={{ px: 2, py: 2, borderBottom: '1px solid rgba(139, 115, 85, 0.1)' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Chip
                      label={user.role === 'client' ? 'Cliente' : user.role === 'stylist' ? 'Styliste' : 'Admin'}
                      size="small"
                      sx={{
                        mt: 0.5,
                        background: 'linear-gradient(135deg, #8B7355, #D4AF37)',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>

                  <MenuItem 
                    onClick={() => { handleClose(); navigate('/profile'); }}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <ListItemIcon>
                      <Person sx={{ fontSize: 20, color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText>Mon Profil</ListItemText>
                  </MenuItem>

                  <MenuItem onClick={handleDashboardClick} sx={{ py: 1.5, px: 2 }}>
                    <ListItemIcon>
                      <Dashboard sx={{ fontSize: 20, color: 'secondary.main' }} />
                    </ListItemIcon>
                    <ListItemText>
                      {user.role === 'client' ? 'Mon Espace' : 
                       user.role === 'stylist' ? 'Espace Styliste' : 
                       'Administration'}
                    </ListItemText>
                  </MenuItem>

                  <Divider sx={{ my: 1 }} />

                  <MenuItem onClick={handleLogoutClick} sx={{ py: 1.5, px: 2, color: 'error.main' }}>
                    <ListItemIcon>
                      <Logout sx={{ fontSize: 20, color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText>Déconnexion</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outlined"
                  sx={{ 
                    borderColor: location.pathname === '/' && !scrolled ? 'rgba(255, 255, 255, 0.6)' : 'primary.main',
                    color: location.pathname === '/' && !scrolled ? 'white' : 'primary.main',
                    px: 3,
                    py: 1,
                    borderRadius: '50px',
                    fontWeight: 500,
                    textTransform: 'none',
                    backdropFilter: 'blur(10px)',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: location.pathname === '/' && !scrolled ? 'white' : 'primary.dark',
                      background: location.pathname === '/' && !scrolled 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(139, 115, 85, 0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(139, 115, 85, 0.2)'
                    }
                  }}
                >
                  Connexion
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="contained"
                  sx={{ 
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                    color: '#2C2C2C',
                    px: 3,
                    py: 1,
                    borderRadius: '50px',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #B8941F 0%, #D4AF37 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)'
                    }
                  }}
                >
                  Inscription
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </Slide>

      {/* Modern Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        ModalProps={{
          BackdropProps: {
            sx: { 
              backgroundColor: 'rgba(44, 44, 44, 0.6)',
              backdropFilter: 'blur(4px)'
            }
          }
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '90vw', sm: '400px' },
            height: '100vh',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 246, 242, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRight: 'none',
            boxShadow: '8px 0 32px rgba(44, 44, 44, 0.15)',
            borderRadius: '0 24px 24px 0'
          }
        }}
      >
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Modern Header */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '32px 24px 24px',
            borderBottom: '1px solid rgba(139, 115, 85, 0.1)',
            background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
            }
          }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  fontFamily: 'Playfair Display, serif',
                  fontStyle: 'italic',
                  fontSize: '2rem',
                  mb: 0.5
                }}
              >
                She
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  fontWeight: 500,
                  textTransform: 'uppercase'
                }}
              >
                Navigation
              </Typography>
            </Box>
            <IconButton
              onClick={handleMobileMenuClose}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                width: 44,
                height: 44,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ flex: 1, padding: '24px 0' }}>
            {menuItems.map((item, index) => (
              <Fade in timeout={300 + index * 100} key={item.path}>
                <Box
                  onClick={() => handleMenuItemClick(item.path)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 24px',
                    cursor: 'pointer',
                    borderRadius: '0 24px 24px 0',
                    margin: '4px 0 4px 12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    background: location.pathname === item.path 
                      ? 'linear-gradient(135deg, rgba(139, 115, 85, 0.1), rgba(212, 175, 55, 0.1))'
                      : 'transparent',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: location.pathname === item.path ? '4px' : '0px',
                      height: '60%',
                      background: item.primary 
                        ? 'linear-gradient(135deg, #D4AF37, #B8941F)'
                        : 'linear-gradient(135deg, #8B7355, #D4AF37)',
                      borderRadius: '0 4px 4px 0',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    },
                    '&:hover': {
                      backgroundColor: item.primary 
                        ? 'rgba(212, 175, 55, 0.15)'
                        : item.highlight 
                          ? 'rgba(139, 115, 85, 0.15)'
                          : 'rgba(139, 115, 85, 0.08)',
                      transform: 'translateX(8px)',
                      boxShadow: '0 8px 24px rgba(139, 115, 85, 0.15)',
                      '&::before': {
                        width: '4px'
                      },
                      '& .menu-icon': {
                        transform: 'scale(1.1)',
                        color: item.primary ? '#D4AF37' : '#8B7355'
                      }
                    }
                  }}
                >
                  {/* Menu Icon */}
                  <Box
                    className="menu-icon"
                    sx={{
                      mr: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: item.primary 
                        ? 'linear-gradient(135deg, #D4AF37, #B8941F)'
                        : item.highlight 
                          ? 'linear-gradient(135deg, #8B7355, #6B5842)'
                          : 'rgba(139, 115, 85, 0.1)',
                      color: item.primary || item.highlight ? 'white' : '#8B7355',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: item.primary || item.highlight 
                        ? '0 4px 12px rgba(139, 115, 85, 0.3)' 
                        : 'none'
                    }}
                  >
                    {item.icon}
                  </Box>

                  {/* Menu Text */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '1rem',
                        fontWeight: item.primary || item.highlight ? 600 : 500,
                        color: '#2C2C2C',
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        letterSpacing: '0.02em',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {item.label}
                    </Typography>
                    {(item.primary || item.highlight) && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          display: 'block',
                          mt: 0.5
                        }}
                      >
                        {item.primary ? 'Réservation rapide' : 'Inscription gratuite'}
                      </Typography>
                    )}
                  </Box>

                  {/* Active Indicator */}
                  {location.pathname === item.path && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B7355, #D4AF37)',
                        boxShadow: '0 2px 8px rgba(139, 115, 85, 0.4)'
                      }}
                    />
                  )}
                </Box>
              </Fade>
            ))}
          </Box>

          {/* Modern Footer */}
          <Box sx={{
            padding: '24px',
            borderTop: '1px solid rgba(139, 115, 85, 0.1)',
            background: 'linear-gradient(135deg, rgba(248, 246, 242, 0.8) 0%, rgba(253, 252, 250, 0.9) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{
              textAlign: 'center',
              mb: 2
            }}>
              <Box sx={{
                width: '40px',
                height: '2px',
                background: 'linear-gradient(90deg, #8B7355, #D4AF37)',
                margin: '0 auto 16px',
                borderRadius: '1px'
              }} />
              <Typography sx={{
                fontSize: '0.875rem',
                color: 'text.secondary',
                fontWeight: 500,
                mb: 1
              }}>
                She Salon Premium
              </Typography>
              <Typography sx={{
                fontSize: '0.75rem',
                color: 'text.tertiary',
                letterSpacing: '0.05em'
              }}>
                Votre beauté, notre passion
              </Typography>
            </Box>
            
            {!user && (
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                <Button
                  onClick={() => { handleMobileMenuClose(); navigate('/login'); }}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    '&:hover': {
                      background: 'rgba(139, 115, 85, 0.1)',
                      borderColor: 'primary.dark'
                    }
                  }}
                >
                  Connexion
                </Button>
                <Button
                  onClick={() => { handleMobileMenuClose(); navigate('/register'); }}
                  variant="contained"
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                    color: '#2C2C2C',
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #B8941F, #D4AF37)',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)'
                    }
                  }}
                >
                  Inscription
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;