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
            sx={{
              color: '#fff',
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 300,
              fontStyle: 'italic'
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
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'translateY(-3px)',
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
        bgcolor: '#F5F5F5',
        py: 6
      }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{ 
                fontWeight: 700, 
                color: '#2C2C2C',
                fontSize: { xs: '1.75rem', md: '2rem' },
                mb: 1
              }}
            >
              TOUS LES SERVICES
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ 
                color: '#666',
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}
            >
              Découvrez nos services et leurs tarifs.
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 3,
            overflowX: { xs: 'auto', md: 'visible' },
            pb: { xs: 2, md: 0 }
          }}>
            {services.map((service, index) => (
              <Box
                key={index}
                sx={{
                  flex: '1 0 auto',
                  width: { xs: '85%', md: '33.333%' },
                  minWidth: { xs: '280px', md: '0' }
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    bgcolor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '75%', // 4:3 aspect ratio
                      bgcolor: '#f8f8f8'
                    }}
                  >
                    <Box
                      component="img"
                      src={service.image}
                      alt={service.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography 
                      variant="h5" 
                      component="h2"
                      sx={{ 
                        mb: 2,
                        fontWeight: 600,
                        fontSize: '1.25rem',
                        color: '#2C2C2C',
                        textTransform: 'uppercase'
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{
                        color: '#666',
                        lineHeight: 1.6,
                        fontSize: '0.95rem'
                      }}
                    >
                      {service.description}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: '#FBF9F6' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 8,
              fontWeight: 600,
              color: '#2C2C2C',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Pourquoi choisir She ?
          </Typography>
          <Grid container spacing={6} alignItems="center">
            {/* Image Column */}
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/image1.jpg"
                alt="Expertise She"
                sx={{
                  width: '100%',
                  height: '500px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
              />
            </Grid>
            {/* Features Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {features.map((feature, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 3,
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(212, 185, 150, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 1,
                            fontWeight: 600,
                            color: '#2C2C2C',
                            fontSize: '1.25rem'
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#666',
                            lineHeight: 1.6,
                            fontSize: '1rem'
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Présentation Section */}
      <Box sx={{ py: 8, background: 'linear-gradient(135deg, #FDFCFA 0%, #F8F6F2 100%)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Slide direction="right" in timeout={800}>
                <Box>
                  <Typography
                    variant="h2"
                    sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}
                  >
                    NOTRE EXPERTISE
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8, color: 'text.primary' }}>
                    She est une plateforme dédiée à la coiffure féminine, spécialisée en colorations, 
                    coupes et soins adaptés à votre style et à votre mode de vie. Nos coiffeuses 
                    s'engagent à créer des looks uniques dans un cadre chaleureux.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    href="/salon"
                    sx={{
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Prendre Rendez-Vous
                    <ArrowForward sx={{ ml: 1 }} />
                  </Button>
                </Box>
              </Slide>
            </Grid>
            <Grid item xs={12} md={6}>
              <Slide direction="left" in timeout={800}>
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -20,
                      left: -20,
                      right: 20,
                      bottom: 20,
                      background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                      borderRadius: 4,
                      zIndex: -1
                    }
                  }}
                >
                  <Card
                    sx={{
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(44,44,44,0.1)'
                    }}
                  >
                    <CardMedia
                      component="img"
                      image="/images/expertise.jpg"
                      alt="Expertise coiffure"
                      sx={{ height: 400, objectFit: 'cover' }}
                    />
                  </Card>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* New Client Section */}
      <Box
        sx={{
          py: 10,
          px: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #D4B996 0%, #E5CEB4 100%)',
            borderRadius: { xs: '24px', md: '48px' },
            transform: 'skewY(-3deg)',
            transformOrigin: '100%'
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h2"
                  sx={{
                    color: '#2C2C2C',
                    fontWeight: 600,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    mb: 3,
                    position: 'relative',
                    display: 'inline-block',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '60%',
                      height: '4px',
                      background: 'rgba(44, 44, 44, 0.2)',
                      borderRadius: '2px'
                    }
                  }}
                >
                  Nouveau Client ?
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#2C2C2C',
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    lineHeight: 1.8,
                    mb: 5,
                    maxWidth: '600px',
                    mx: { xs: 'auto', md: 0 }
                  }}
                >
                  La clé d'une coiffure réussie réside dans la connexion entre la cliente et la coiffeuse. Notre approche personnalisée garantit que chaque rendez-vous est une expérience unique.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  href="/register"
                  sx={{
                    bgcolor: '#2C2C2C',
                    color: '#fff',
                    px: 4,
                    py: 2,
                    borderRadius: '30px',
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 10px 20px rgba(44, 44, 44, 0.15)',
                    '&:hover': {
                      bgcolor: '#1a1a1a',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 15px 30px rgba(44, 44, 44, 0.2)'
                    }
                  }}
                >
                  Complétez le formulaire
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    zIndex: 0
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: 'rgba(44, 44, 44, 0.05)',
                    zIndex: 0
                  }
                }}
              >
                <Box
                  component="img"
                  src="/images/image3.jpg"
                  alt="Nouvelle cliente"
                  sx={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(44, 44, 44, 0.1)',
                    position: 'relative',
                    zIndex: 1
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Partenaires Section */}
      <Box sx={{ py: 8, background: '#F8F6F2' }}>
        <Container maxWidth="lg">
          <Slide direction="up" in timeout={800}>
            <Box textAlign="center">
              <Typography variant="h3" sx={{ mb: 6, fontWeight: 600, color: 'text.primary' }}>
                NOS PARTENAIRES
              </Typography>
              <Grid container spacing={4} justifyContent="center" alignItems="center">
                {partenaires.map((partenaire, index) => (
                  <Grid item xs={6} sm={4} md={2.4} key={index}>
                    <Grow in timeout={1000 + index * 200}>
                      <Card
                        sx={{
                          p: 3,
                          background: 'white',
                          borderRadius: 3,
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 10px 25px rgba(44,44,44,0.1)'
                          }
                        }}
                      >
                        <img
                          src={partenaire.logo}
                          alt={partenaire.name}
                          style={{
                            maxHeight: 60,
                            width: 'auto',
                            filter: 'grayscale(100%)',
                            transition: 'filter 0.3s ease',
                          }}
                          onMouseEnter={(e) => e.target.style.filter = 'grayscale(0%)'}
                          onMouseLeave={(e) => e.target.style.filter = 'grayscale(100%)'}
                        />
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Slide>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          background: 'linear-gradient(135deg, #2C2C2C 0%, #4A4A4A 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            Droits d'auteur © 2025 She
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Plateforme de réservation pour coiffeuses
          </Typography>
        </Container>
      </Box>
    </Box>
  );
} 