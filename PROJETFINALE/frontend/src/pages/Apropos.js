import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Button,
  Card,
  CardContent,
  Fade,
  Slide,
  IconButton
} from '@mui/material';
import {
  AutoAwesome,
  ArrowForward,
  Palette,
  TrendingUp,
  Star
} from '@mui/icons-material';

const AproposPage = () => {
  const navigate = useNavigate();

  const galleryImages = [
    '/images/image.jpg',
    '/images/image1.jpg',
    '/images/image2.jpg',
    '/images/image3.jpg',
    '/images/image4.jpg',
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FDFCFA 0%, #F8F6F2 50%, #F0EDE7 100%)',
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
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: { xs: 12, sm: 14 }, pb: 8 }}>
        {/* Hero Section */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3
              }}
            >
              À PROPOS DE SHE
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              L'art de la coiffure réinventé pour révéler votre beauté unique
            </Typography>
          </Box>
        </Fade>

        {/* Mission Section */}
        <Slide direction="up" in timeout={1000}>
          <Grid container spacing={6} alignItems="center" sx={{ mb: 10 }}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 115, 85, 0.1)',
                  boxShadow: '0 24px 48px rgba(44, 44, 44, 0.12)',
                  overflow: 'hidden',
                  height: '100%'
                }}
              >
                <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 4
                    }}
                  >
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
                      <AutoAwesome sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 700,
                        color: 'text.primary'
                      }}
                    >
                      Notre Mission
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1.125rem',
                      lineHeight: 1.8,
                      color: 'text.secondary'
                    }}
                  >
                    Notre mission consiste à élever l'art de la coiffure en offrant des services haut de gamme personnalisés et en valorisant les coiffeurs comme des artistes, pour des résultats parfaitement adaptés au mode de vie de chaque client.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 24px 48px rgba(44, 44, 44, 0.12)',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.3s ease'
                  }
                }}
              >
                <img 
                  src="/images/image6.jpg" 
                  alt="Salon intérieur" 
                  style={{ 
                    width: '100%', 
                    height: '400px', 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Slide>

        {/* Section 2: Image Banner */}
        <Box className="gallery-banner section-spacing">
          {galleryImages.map((img, index) => (
            <img key={index} src={img} alt={`Galerie ${index + 1}`} className="gallery-image" />
          ))}
        </Box>

        {/* Section 3: Philosophy & CTA */}
        <Box className="philosophy-section section-spacing">
          <Typography variant="body1" className="section-text centered-text">
            Nous croyons que la clé d'une coiffure réussie réside dans la connexion entre le client et l'artiste coiffeur. C'est pourquoi nous prenons soin de créer le "match parfait", en associant chaque client à l'un de nos stylistes en fonction de leurs forces, compétences et vos besoins spécifiques.
          </Typography>
          <Typography variant="body1" className="section-text centered-text" style={{ marginTop: '20px' }}>
            Cette approche personnalisée garantit que chaque rendez-vous est une expérience unique, où vos désirs sont compris et réalisés avec expertise.
          </Typography>
          <Typography variant="h4" className="philosophy-cta-text">
            Ensemble, nous créons des looks qui vous correspondent parfaitement.
          </Typography>
          <Button 
            variant="outlined" 
            className="cta-button-propos"
            onClick={() => navigate('/reservation')}
          >
            Complétez le formulaire
          </Button>
        </Box>

        {/* Section 4: Extra info/image */}
        <Grid container spacing={8} className="section-spacing" columns={{ xs: 12, md: 12 }} sx={{ alignItems: 'center' }}>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <img src="/images/image7.jpg" alt="Détail salon" className="section-image" />
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Box className="text-content">
              <Typography variant="h3" className="section-subtitle">
                Notre Engagement
              </Typography>
              <Typography variant="body1" className="section-text">
                Nous nous engageons à utiliser uniquement des produits de la plus haute qualité, respectueux de vos cheveux et de l'environnement. Notre équipe se forme continuellement aux dernières techniques pour vous offrir des services à la pointe de la tendance.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AproposPage; 