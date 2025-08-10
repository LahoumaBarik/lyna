import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Fade,
  Slide
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Schedule,
  ArrowForward
} from '@mui/icons-material';

const horaires = [
  { jour: 'Lundi', heures: '09:00 - 17:00' },
  { jour: 'Mardi', heures: '09:00 - 18:00' },
  { jour: 'Mercredi', heures: '09:00 - 19:00' },
  { jour: 'Jeudi', heures: '09:00 - 19:00' },
  { jour: 'Vendredi', heures: '09:00 - 18:00' },
  { jour: 'Samedi', heures: '09:00 - 16:00' },
  { jour: 'Dimanche', heures: 'Fermé' },
];

export default function SalonInfo() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FDFCFA 0%, #F8F6F2 50%, #F0EDE7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23D4AF37" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.4
        }
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        <Fade in timeout={800}>
          <Card
            sx={{
              borderRadius: '32px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 115, 85, 0.1)',
              boxShadow: '0 32px 64px rgba(44, 44, 44, 0.15)',
              overflow: 'hidden',
              textAlign: 'center'
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 8 } }}>
              {/* Header */}
              <Typography
                variant="h1"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  fontSize: { xs: '3rem', md: '4rem' },
                  background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                She
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 300,
                  mb: 6
                }}
              >
                Bienvenue
              </Typography>

              {/* Contact Information */}
              <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <LocationOn sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                      1234 rue saint-catherine<br />Montréal QC
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Phone sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                      (514) 123-4567
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Email sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                      contact@she.co
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Hours */}
              <Box
                sx={{
                  mb: 6,
                  p: 4,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.05) 0%, rgba(212, 175, 151, 0.05) 100%)',
                  border: '1px solid rgba(139, 115, 85, 0.1)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                  <Schedule sx={{ color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Horaires d'ouverture
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {horaires.map(h => (
                    <Grid item xs={12} sm={6} md={4} key={h.jour}>
                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {h.jour}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: h.heures === 'Fermé' ? 'error.main' : 'text.secondary',
                            fontWeight: h.heures === 'Fermé' ? 500 : 400
                          }}
                        >
                          {h.heures}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* CTA Button */}
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/rendez-vous')}
                sx={{
                  background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                  color: 'white',
                  fontWeight: 700,
                  px: 6,
                  py: 2,
                  fontSize: '1.125rem',
                  borderRadius: '12px',
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(139, 115, 85, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #D4AF37 0%, #8B7355 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(139, 115, 85, 0.4)'
                  }
                }}
              >
                Prendre un rendez-vous
              </Button>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
} 