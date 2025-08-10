import React, { useState } from 'react';
import {
  Box,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  Zoom,
  Fade
} from '@mui/material';
import {
  Event,
  Phone,
  WhatsApp,
  Instagram,
  Facebook,
  LocationOn,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FloatingActionButton = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: <Event />,
      name: 'Réservation',
      action: () => navigate('/rendez-vous'),
      color: '#8B5A3C'
    },
    {
      icon: <Phone />,
      name: 'Appeler',
      action: () => window.open('tel:+33123456789'),
      color: '#4CAF50'
    },
    {
      icon: <WhatsApp />,
      name: 'WhatsApp',
      action: () => window.open('https://wa.me/33123456789'),
      color: '#25D366'
    },
    {
      icon: <Instagram />,
      name: 'Instagram',
      action: () => window.open('https://instagram.com/shesalon'),
      color: '#E4405F'
    },
    {
      icon: <Facebook />,
      name: 'Facebook',
      action: () => window.open('https://facebook.com/shesalon'),
      color: '#1877F2'
    },
    {
      icon: <LocationOn />,
      name: 'Localisation',
      action: () => window.open('https://maps.google.com/?q=shesalon'),
      color: '#F44336'
    },
    {
      icon: <Schedule />,
      name: 'Horaires',
      action: () => navigate('/salon'),
      color: '#FF9800'
    }
  ];

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <Zoom in={true} timeout={800}>
        <SpeedDial
          ariaLabel="Actions rapides"
          sx={{
            '& .MuiFab-primary': {
              width: 64,
              height: 64,
              backgroundColor: 'linear-gradient(135deg, #8B5A3C, #B78C68)',
              '&:hover': {
                backgroundColor: 'linear-gradient(135deg, #B78C68, #8B5A3C)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '& .MuiSpeedDialAction-fab': {
              width: 48,
              height: 48,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }
          }}
          icon={<SpeedDialIcon />}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          direction="up"
          FabProps={{
            size: 'large',
            sx: {
              boxShadow: '0 8px 25px rgba(139, 90, 60, 0.3)',
              '&:hover': {
                boxShadow: '0 12px 35px rgba(139, 90, 60, 0.4)',
              }
            }
          }}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.action();
                handleClose();
              }}
              sx={{
                '& .MuiFab-primary': {
                  backgroundColor: action.color,
                  '&:hover': {
                    backgroundColor: action.color,
                    transform: 'scale(1.1)',
                  }
                }
              }}
            />
          ))}
        </SpeedDial>
      </Zoom>
    </Box>
  );
};

export default FloatingActionButton;
