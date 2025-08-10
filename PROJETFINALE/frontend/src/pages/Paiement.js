import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Fade,
  Slide
} from '@mui/material';
import {
  Payment,
  Security,
  CheckCircle,
  ArrowForward
} from '@mui/icons-material';

function Paiement() {
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
            <CardContent sx={{ p: { xs: 6, md: 10 } }}>
              {/* Header */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4
                }}
              >
                <Payment sx={{ color: 'white', fontSize: 48 }} />
              </Box>

              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3rem' },
                  background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}
              >
                Paiement Sécurisé
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  mb: 6,
                  maxWidth: '500px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Procédez au paiement de votre réservation en toute sécurité
              </Typography>

              {/* Security Features */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 6, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security sx={{ color: 'primary.main', fontSize: 24 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Paiement SSL
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: 'primary.main', fontSize: 24 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Données Protégées
                  </Typography>
                </Box>
              </Box>

              {/* Payment Button */}
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
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
                Procéder au paiement
              </Button>

              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mt: 4,
                  fontSize: '0.875rem'
                }}
              >
                Vos informations de paiement sont cryptées et sécurisées
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}

export default Paiement; 