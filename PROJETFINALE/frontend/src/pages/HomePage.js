import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Fade,
  Slide,
  Grow,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AccessTime,
  Star,
  People,
  Spa,
  ArrowForward,
  CheckCircle,
  Favorite,
  Brush
} from '@mui/icons-material';

const partenaires = [
  { name: "L'Oréal", logo: '/images/loreal.png' },
  { name: "Kérastase", logo: '/images/kerastase.png' },
  { name: "Great Lengths", logo: '/images/greatlengths.png' },
  { name: "Olaplex", logo: '/images/olaplex.png' },
  { name: "Wella", logo: '/images/wella.png' }
];

const features = [
  {
    icon: <Spa sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: "Expertise Professionnelle",
    description: "Nos coiffeuses certifiées créent des looks uniques adaptés à votre style."
  },
  {
    icon: <AccessTime sx={{ fontSize: 40, color: 'secondary.main' }} />,
    title: "Réservation Simple",
    description: "Réservez en quelques clics, 24h/24 et 7j/7, selon vos disponibilités."
  },
  {
    icon: <Star sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: "Qualité Premium",
    description: "Produits de luxe et techniques avancées pour des résultats exceptionnels."
  }
];

const services = [
  {
    title: "Coloration",
    description: "Transformer votre chevelure avec des nuances sur mesure pour un effet lumineux et naturel.",
    icon: <Brush sx={{ fontSize: 30, color: 'primary.main' }} />,
    image: '/images/coloration.jpg'
  },
  {
    title: "Coupe",
    description: "Sculpter et définir votre coiffure pour un look parfaitement adapté à votre visage et à votre style.",
    icon: <Favorite sx={{ fontSize: 30, color: 'secondary.main' }} />,
    image: '/images/coupe.jpg'
  },
  {
    title: "Mise en Plis",
    description: "L'art de lisser, volumiser et faire briller vos cheveux pour un look élégant et durable.",
    icon: <Spa sx={{ fontSize: 30, color: 'primary.main' }} />,
    image: '/images/miseenplis.jpg'
  }
];

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          width: '100%',
          backgroundImage: 'url("/images/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            zIndex: 1
          }
        }}
      >
        {/* Title Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '100%',
            zIndex: 2
          }}
        >
          <Typography
            variant="h1"
            className="fade-in"
            sx={{
              color: '#fff',
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 300,
              fontStyle: 'italic',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              letterSpacing: '2px'
            }}
          >
            l'art en mouvement
          </Typography>
        </Box>

        {/* Button Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '100%',
            zIndex: 2
          }}
        >
          <Button
            variant="contained"
            size="large"
            href="/salon"
            className="slide-in-up"
            sx={{
              background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
              color: '#2C2C2C',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              borderRadius: '50px',
              textTransform: 'none',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              fontWeight: 600,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '200%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmer 2s infinite',
              },
              '@keyframes shimmer': {
                '0%': {
                  left: '-100%',
                },
                '100%': {
                  left: '100%',
                },
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #B8A08A 0%, #A08F7A 100%)',
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            Prendre Rendez-Vous
          </Button>
        </Box>
      </Box>

      {/* Services Section */}
      <Box sx={{ 
        background: 'linear-gradient(180deg, #FDFCFA 0%, #F8F6F2 100%)',
        py: 8
      }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography
              variant="h2"
              component="h1"
              className="fade-in"
              sx={{ 
                fontWeight: 700, 
                color: '#2C2C2C',
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                letterSpacing: '-0.01em',
                marginBottom: 2
              }}
            >
              Nos Services
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#6B6B6B',
                fontSize: '1.1rem',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6
              }}
            >
              Découvrez notre gamme complète de services de coiffure, 
              conçus pour sublimer votre beauté naturelle.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} md={4} key={service.title}>
                <Grow in timeout={1000 + index * 200}>
                  <Card
                    className="card-hover"
                    sx={{
                      height: '100%',
                      borderRadius: '16px',
                      background: '#FFFFFF',
                      boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0px 12px 24px rgba(44, 44, 44, 0.12)',
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={service.image}
                      alt={service.title}
                      sx={{
                        borderTopLeftRadius: '16px',
                        borderTopRightRadius: '16px',
                        objectFit: 'cover'
                      }}
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {service.icon}
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 600,
                            color: '#2C2C2C',
                            marginLeft: 1
                          }}
                        >
                          {service.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#6B6B6B',
                          lineHeight: 1.6
                        }}
                      >
                        {service.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        background: '#FFFFFF',
        py: 8
      }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography
              variant="h2"
              className="fade-in"
              sx={{ 
                fontWeight: 700, 
                color: '#2C2C2C',
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                letterSpacing: '-0.01em',
                marginBottom: 2
              }}
            >
              Pourquoi Nous Choisir
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={feature.title}>
                <Fade in timeout={1000 + index * 200}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #F8F6F2 0%, #F0EDE7 100%)',
                      height: '100%',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0px 8px 16px rgba(44, 44, 44, 0.12)',
                      }
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: '#2C2C2C',
                        marginBottom: 2
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6B6B6B',
                        lineHeight: 1.6
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Partners Section */}
      <Box sx={{ 
        background: 'linear-gradient(180deg, #F8F6F2 0%, #F0EDE7 100%)',
        py: 6
      }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              className="fade-in"
              sx={{ 
                fontWeight: 600, 
                color: '#2C2C2C',
                fontSize: { xs: '1.5rem', md: '2rem' },
                marginBottom: 2
              }}
            >
              Nos Partenaires
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#6B6B6B',
                fontSize: '1.1rem'
              }}
            >
              Nous collaborons avec les meilleures marques pour vous offrir 
              des produits de qualité exceptionnelle.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center" alignItems="center">
            {partenaires.map((partenaire, index) => (
              <Grid item xs={6} sm={4} md={2} key={partenaire.name}>
                <Slide direction="up" in timeout={1000 + index * 100}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      boxShadow: '0px 2px 8px rgba(44, 44, 44, 0.06)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0px 8px 16px rgba(44, 44, 44, 0.12)',
                      }
                    }}
                  >
                    <img
                      src={partenaire.logo}
                      alt={partenaire.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '60px',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
} 