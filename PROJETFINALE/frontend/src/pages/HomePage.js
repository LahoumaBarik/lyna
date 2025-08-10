import React, { useState, useEffect } from 'react';
import './HomePage.css';
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
  useMediaQuery,
  IconButton,
  Chip,
  Avatar
} from '@mui/material';
import {
  AccessTime,
  Star,
  People,
  Spa,
  ArrowForward,
  CheckCircle,
  Favorite,
  Brush,
  PlayArrow,
  AutoAwesome,
  TrendingUp,
  Schedule,
  EmojiEvents
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
    icon: <AutoAwesome sx={{ fontSize: 48 }} />,
    title: "Expertise Professionnelle",
    description: "Nos stylistes certifiées maîtrisent les dernières tendances et techniques pour créer votre look parfait.",
    color: 'primary.main',
    gradient: 'linear-gradient(135deg, #8B7355 0%, #B5A593 100%)'
  },
  {
    icon: <Schedule sx={{ fontSize: 48 }} />,
    title: "Réservation Intelligente",
    description: "Système de réservation en ligne 24h/24 avec confirmation instantanée et rappels automatiques.",
    color: 'secondary.main',
    gradient: 'linear-gradient(135deg, #D4AF37 0%, #E6C866 100%)'
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 48 }} />,
    title: "Excellence Garantie",
    description: "Produits premium et service 5 étoiles pour une expérience beauté inoubliable.",
    color: 'primary.main',
    gradient: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)'
  },
  {
    icon: <TrendingUp sx={{ fontSize: 48 }} />,
    title: "Tendances Actuelles",
    description: "Toujours à la pointe de la mode avec les techniques et styles les plus récents.",
    color: 'secondary.main',
    gradient: 'linear-gradient(135deg, #B5A593 0%, #D4AF37 100%)'
  }
];

const services = [
  {
    title: "Coloration",
    description: "Révélez votre personnalité avec des couleurs sur-mesure, des techniques de pointe et des produits premium pour un résultat éclatant.",
    icon: <Brush sx={{ fontSize: 36 }} />,
    image: '/images/coloration.jpg',
    price: "À partir de 85€",
    duration: "2h - 3h30",
    badge: "Populaire"
  },
  {
    title: "Coupe & Style",
    description: "Sculptez votre silhouette capillaire avec une coupe personnalisée qui sublime votre visage et révèle votre style unique.",
    icon: <Favorite sx={{ fontSize: 36 }} />,
    image: '/images/coupe.jpg',
    price: "À partir de 65€",
    duration: "1h - 1h30",
    badge: "Tendance"
  },
  {
    title: "Soins & Mise en Plis",
    description: "Nourrissez et sublimez vos cheveux avec des soins professionnels et un styling expert pour un éclat durable.",
    icon: <Spa sx={{ fontSize: 36 }} />,
    image: '/images/miseenplis.jpg',
    price: "À partir de 45€",
    duration: "45min - 1h15",
    badge: "Nouveau"
  }
];

const testimonials = [
  {
    name: "Marie L.",
    role: "Cliente fidèle",
    content: "Le meilleur salon de coiffure que j'ai fréquenté ! Les stylistes sont professionnelles et créatives. Je recommande vivement !",
    rating: 5,
    avatar: "/images/image1.jpg"
  },
  {
    name: "Sophie M.",
    role: "Nouvelle cliente",
    content: "Service exceptionnel et résultat au-delà de mes attentes. L'ambiance est chaleureuse et professionnelle.",
    rating: 5,
    avatar: "/images/image2.jpg"
  },
  {
    name: "Claire D.",
    role: "Cliente régulière",
    content: "Toujours parfait ! Les produits utilisés sont de qualité et les conseils sont personnalisés. Un vrai bonheur !",
    rating: 5,
    avatar: "/images/image3.jpg"
  }
];

const stats = [
  { number: "500+", label: "Clients satisfaits", icon: <People sx={{ fontSize: 32 }} /> },
  { number: "15+", label: "Années d'expérience", icon: <Star sx={{ fontSize: 32 }} /> },
  { number: "98%", label: "Taux de satisfaction", icon: <CheckCircle sx={{ fontSize: 32 }} /> },
  { number: "24/7", label: "Réservation en ligne", icon: <AccessTime sx={{ fontSize: 32 }} /> }
];

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Modern Hero Section */}
      <Box
        className="hero-section"
        sx={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(44, 44, 44, 0.8) 0%, rgba(139, 115, 85, 0.6) 50%, rgba(212, 175, 55, 0.4) 100%), url("/images/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed',
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(139, 115, 85, 0.1))',
            animation: 'float 6s ease-in-out infinite',
            zIndex: 1
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '5%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.1), rgba(212, 175, 55, 0.1))',
            animation: 'float 8s ease-in-out infinite reverse',
            zIndex: 1
          }}
        />

        {/* Hero Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.875rem',
                  letterSpacing: '0.2em',
                  fontWeight: 500,
                  mb: 2,
                  display: 'block'
                }}
              >
                SALON DE COIFFURE PREMIUM
              </Typography>
              
              <Typography
                className="hero-title"
                sx={{
                  color: '#fff',
                  fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
                  fontWeight: 300,
                  fontFamily: 'Playfair Display, serif',
                  fontStyle: 'italic',
                  mb: 3,
                  textShadow: '2px 4px 12px rgba(0, 0, 0, 0.4)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em'
                }}
              >
                L'Art en Mouvement
              </Typography>
              
              <Typography
                className="hero-subtitle"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: { xs: '1.125rem', md: '1.375rem' },
                  fontWeight: 400,
                  mb: 5,
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Découvrez l'excellence capillaire dans un cadre raffiné où chaque coupe devient une œuvre d'art personnalisée
              </Typography>

              <Box className="hero-cta" sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  href="/rendez-vous"
                  endIcon={<ArrowForward />}
                  sx={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                    color: '#2C2C2C',
                    px: 4,
                    py: 2,
                    fontSize: '1.125rem',
                    borderRadius: '50px',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(212, 175, 55, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 40px rgba(212, 175, 55, 0.5)',
                      '&::before': {
                        left: '100%',
                      }
                    }
                  }}
                >
                  Réserver Maintenant
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  href="/services"
                  startIcon={<PlayArrow />}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    px: 4,
                    py: 2,
                    fontSize: '1.125rem',
                    borderRadius: '50px',
                    fontWeight: 500,
                    textTransform: 'none',
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  Nos Services
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>

        {/* Scroll Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            animation: 'float 2s ease-in-out infinite'
          }}
        >
          <Box
            sx={{
              width: '2px',
              height: '40px',
              background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8))',
              margin: '0 auto',
              borderRadius: '1px'
            }}
          />
        </Box>
      </Box>

      {/* Modern Services Section */}
      <Box className="section" sx={{ background: 'linear-gradient(135deg, #FDFCFA 0%, #F8F6F2 100%)' }}>
        <Container maxWidth="lg">
          <Slide direction="up" in timeout={800}>
            <Box className="section-header">
              <Typography
                variant="overline"
                sx={{
                  color: 'primary.main',
                  fontSize: '0.875rem',
                  letterSpacing: '0.2em',
                  fontWeight: 600,
                  mb: 2,
                  display: 'block'
                }}
              >
                NOS SERVICES PREMIUM
              </Typography>
              <Typography
                variant="h2"
                className="section-title"
                sx={{
                  background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2
                }}
              >
                Excellence & Savoir-Faire
              </Typography>
              <Typography
                variant="subtitle1"
                className="section-subtitle"
              >
                Découvrez notre gamme complète de services haut de gamme, pensés pour révéler votre beauté naturelle
              </Typography>
            </Box>
          </Slide>

          <Box className="services-grid-container">
            {services.map((service, index) => (
              <Grow in timeout={1000 + index * 200}>
                <Card
                  className="service-card modern-card hover-lift"
                  sx={{
                    position: 'relative',
                    overflow: 'visible',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      background: service.gradient || 'linear-gradient(135deg, #8B7355, #D4AF37)',
                      borderRadius: 'inherit',
                      zIndex: -1,
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    },
                    '&:hover::before': {
                      opacity: 0.1
                    }
                  }}
                >
                  {/* Service Badge */}
                  {service.badge && (
                    <Chip
                      label={service.badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 2,
                        background: service.badge === 'Populaire' ? 'linear-gradient(135deg, #D4AF37, #B8941F)' :
                                   service.badge === 'Tendance' ? 'linear-gradient(135deg, #8B7355, #6B5842)' :
                                   'linear-gradient(135deg, #10B981, #047857)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  )}

                  {/* Service Image */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: 280,
                      overflow: 'hidden',
                      borderRadius: '20px 20px 0 0'
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={service.image}
                      alt={service.title}
                      sx={{
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                    
                    {/* Service Icon Overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      {service.icon}
                    </Box>
                  </Box>

                  <Box className="service-card-content">
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        color: 'text.primary',
                        mb: 2,
                        lineHeight: 1.3
                      }}
                    >
                      {service.title}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      className="service-card-description"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.6,
                        fontSize: '0.95rem'
                      }}
                    >
                      {service.description}
                    </Typography>

                    {/* Service Details */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            color: 'primary.main',
                            mb: 0.5
                          }}
                        >
                          {service.price}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.tertiary',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <AccessTime sx={{ fontSize: 14 }} />
                          {service.duration}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      fullWidth
                      href="/services"
                      sx={{
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        fontWeight: 500,
                        py: 1.5,
                        borderRadius: '12px',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                          color: 'white',
                          borderColor: 'transparent',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      En Savoir Plus
                    </Button>
                  </Box>
                </Card>
              </Grow>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box className="section" sx={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F6F2 100%)' }}>
        <Container maxWidth="lg">
          <Slide direction="up" in timeout={800}>
            <Box className="section-header" sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'secondary.main',
                  fontSize: '0.875rem',
                  letterSpacing: '0.2em',
                  fontWeight: 600,
                  mb: 2,
                  display: 'block'
                }}
              >
                TÉMOIGNAGES CLIENTS
              </Typography>
              <Typography
                variant="h2"
                className="section-title"
                sx={{
                  background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2
                }}
              >
                Ce que disent nos clients
              </Typography>
              <Typography
                variant="subtitle1"
                className="section-subtitle"
              >
                Découvrez les expériences de nos clients satisfaits
              </Typography>
            </Box>
          </Slide>

          <Box className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <Grow in timeout={800 + index * 200}>
                <Card
                  className="testimonial-card"
                  sx={{
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(139, 115, 85, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 32px rgba(139, 115, 85, 0.15)'
                    }
                  }}
                >
                  <Box className="testimonial-content">
                    <Box className="testimonial-text">
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                          fontStyle: 'italic',
                          fontSize: '1rem'
                        }}
                      >
                        "{testimonial.content}"
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <Avatar
                        src={testimonial.avatar}
                        sx={{
                          width: 56,
                          height: 56,
                          border: '3px solid',
                          borderColor: 'primary.main'
                        }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grow>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box className="section" sx={{ background: 'linear-gradient(135deg, #8B7355 0%, #6B5842 100%)', color: 'white' }}>
        <Container maxWidth="lg">
          <Slide direction="up" in timeout={800}>
            <Box className="section-header" sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="h2"
                className="section-title"
                sx={{
                  color: 'white',
                  mb: 2
                }}
              >
                Chiffres clés
              </Typography>
              <Typography
                variant="subtitle1"
                className="section-subtitle"
                sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                Notre engagement en chiffres
              </Typography>
            </Box>
          </Slide>

          <Box className="stats-grid">
            {stats.map((stat, index) => (
              <Grow in timeout={800 + index * 200}>
                <Box className="stat-item">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      margin: '0 auto 16px',
                      border: '2px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      mb: 1,
                      fontSize: 'clamp(2rem, 4vw, 3rem)'
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 500
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grow>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Modern Features Section */}
      <Box className="section" sx={{ background: 'linear-gradient(135deg, #F8F6F2 0%, #FDFCFA 100%)' }}>
        <Container maxWidth="lg">
          <Slide direction="up" in timeout={800}>
            <Box className="section-header">
              <Typography
                variant="overline"
                sx={{
                  color: 'secondary.main',
                  fontSize: '0.875rem',
                  letterSpacing: '0.2em',
                  fontWeight: 600,
                  mb: 2,
                  display: 'block'
                }}
              >
                POURQUOI NOUS CHOISIR
              </Typography>
              <Typography
                variant="h2"
                className="section-title"
                sx={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #8B7355 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2
                }}
              >
                L'Excellence à Votre Service
              </Typography>
              <Typography
                variant="subtitle1"
                className="section-subtitle"
              >
                Découvrez ce qui fait de She le choix privilégié des femmes exigeantes
              </Typography>
            </Box>
          </Slide>

          <Grid container spacing={6} alignItems="center">
            {/* Image Column */}
            <Grid item xs={12} md={6}>
              <Slide direction="right" in timeout={1000}>
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -30,
                      left: -30,
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(139, 115, 85, 0.2))',
                      zIndex: 0,
                      animation: 'float 6s ease-in-out infinite'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -20,
                      right: -20,
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.2), rgba(212, 175, 55, 0.2))',
                      zIndex: 0,
                      animation: 'float 8s ease-in-out infinite reverse'
                    }
                  }}
                >
                  <Card
                    sx={{
                      borderRadius: '24px',
                      overflow: 'hidden',
                      position: 'relative',
                      zIndex: 1,
                      boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 32px 64px rgba(0,0,0,0.15)'
                      },
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <CardMedia
                      component="img"
                      image="/images/image1.jpg"
                      alt="Excellence She"
                      sx={{ 
                        height: { xs: 300, md: 500 },
                        objectFit: 'cover'
                      }}
                    />
                  </Card>
                </Box>
              </Slide>
            </Grid>

            {/* Features Column */}
            <Grid item xs={12} md={6}>
              <Slide direction="left" in timeout={1000}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {features.map((feature, index) => (
                    <Grow in timeout={1200 + index * 200} key={index}>
                      <Card
                        className="feature-card hover-lift"
                        sx={{
                          p: 3,
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '20px',
                          border: '1px solid rgba(139, 115, 85, 0.1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            background: feature.gradient,
                            transition: 'width 0.3s ease'
                          },
                          '&:hover::before': {
                            width: '8px'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                          <Box
                            sx={{
                              width: 72,
                              height: 72,
                              borderRadius: '50%',
                              background: feature.gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              flexShrink: 0,
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                inset: -4,
                                borderRadius: '50%',
                                background: feature.gradient,
                                opacity: 0.2,
                                zIndex: -1,
                                transition: 'all 0.3s ease'
                              },
                              '&:hover::after': {
                                inset: -8,
                                opacity: 0.3
                              }
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h5"
                              sx={{
                                mb: 1.5,
                                fontWeight: 700,
                                color: 'text.primary',
                                fontSize: '1.375rem',
                                lineHeight: 1.3
                              }}
                            >
                              {feature.title}
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                color: 'text.secondary',
                                lineHeight: 1.7,
                                fontSize: '1rem'
                              }}
                            >
                              {feature.description}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Grow>
                  ))}
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Modern CTA Section */}
      <Box
        className="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 50%, #B5A593 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Slide direction="right" in timeout={1000}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      letterSpacing: '0.2em',
                      fontWeight: 600,
                      mb: 2,
                      display: 'block'
                    }}
                  >
                    PREMIÈRE VISITE
                  </Typography>
                  
                  <Typography
                    variant="h2"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { xs: '2.5rem', md: '4rem' },
                      mb: 3,
                      lineHeight: 1.1,
                      textShadow: '2px 4px 8px rgba(0, 0, 0, 0.3)',
                      position: 'relative'
                    }}
                  >
                    Nouveau Client ?
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontSize: { xs: '1.125rem', md: '1.375rem' },
                      lineHeight: 1.7,
                      mb: 5,
                      maxWidth: '600px',
                      mx: { xs: 'auto', md: 0 },
                      fontWeight: 400
                    }}
                  >
                    Commencez votre parcours beauté avec nous. Notre équipe d'experts vous accompagne pour créer le look parfait qui révèle votre personnalité unique.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      href="/register"
                      sx={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        color: '#2C2C2C',
                        px: 4,
                        py: 2,
                        borderRadius: '50px',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          background: 'white',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)'
                        }
                      }}
                    >
                      Commencer Maintenant
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      href="/a-propos"
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.6)',
                        px: 4,
                        py: 2,
                        borderRadius: '50px',
                        fontSize: '1.125rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: '2px',
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      En Savoir Plus
                    </Button>
                  </Box>
                </Box>
              </Slide>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Slide direction="left" in timeout={1000}>
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -30,
                      right: -30,
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      zIndex: 0,
                      animation: 'float 8s ease-in-out infinite'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -20,
                      left: -20,
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      zIndex: 0,
                      animation: 'float 6s ease-in-out infinite reverse'
                    }
                  }}
                >
                  <Card
                    sx={{
                      borderRadius: '32px',
                      overflow: 'hidden',
                      position: 'relative',
                      zIndex: 1,
                      boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
                      transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.02)',
                        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.25)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      image="/images/image3.jpg"
                      alt="Nouvelle cliente"
                      sx={{
                        height: { xs: 300, md: 450 },
                        objectFit: 'cover'
                      }}
                    />
                  </Card>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Modern Partners Section */}
      <Box className="section" sx={{ background: 'linear-gradient(135deg, #F8F6F2 0%, #FDFCFA 100%)' }}>
        <Container maxWidth="lg">
          <Slide direction="up" in timeout={800}>
            <Box className="section-header">
              <Typography
                variant="overline"
                sx={{
                  color: 'primary.main',
                  fontSize: '0.875rem',
                  letterSpacing: '0.2em',
                  fontWeight: 600,
                  mb: 2,
                  display: 'block'
                }}
              >
                PARTENAIRES DE CONFIANCE
              </Typography>
              <Typography
                variant="h2"
                className="section-title"
                sx={{
                  background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2
                }}
              >
                Marques Premium
              </Typography>
              <Typography
                variant="subtitle1"
                className="section-subtitle"
              >
                Nous travaillons exclusivement avec les meilleures marques du secteur pour vous garantir des résultats exceptionnels
              </Typography>
            </Box>
          </Slide>

          <Grid container spacing={4} justifyContent="center" alignItems="center">
            {partenaires.map((partenaire, index) => (
              <Grid item xs={6} sm={4} md={2.4} key={index}>
                <Grow in timeout={1000 + index * 200}>
                  <Card
                    className="modern-card hover-scale"
                    sx={{
                      p: 4,
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '20px',
                      border: '1px solid rgba(139, 115, 85, 0.1)',
                      textAlign: 'center',
                      minHeight: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(139, 115, 85, 0.05), transparent)',
                        transition: 'left 0.5s ease'
                      },
                      '&:hover::before': {
                        left: '100%'
                      },
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 16px 32px rgba(139, 115, 85, 0.15)'
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={partenaire.logo}
                      alt={partenaire.name}
                      sx={{
                        maxHeight: { xs: 40, md: 60 },
                        width: 'auto',
                        maxWidth: '100%',
                        filter: 'grayscale(60%) brightness(1.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          filter: 'grayscale(0%) brightness(1)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>

          {/* Trust Indicators */}
          <Fade in timeout={1500}>
            <Box sx={{ mt: 6, textAlign: 'center' }}>
              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10B981, #047857)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Produits Authentiques
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Garantie 100%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      <Star sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Qualité Premium
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Résultats professionnels
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B7355, #6B5842)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      <People sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Expertise Certifiée
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Formation continue
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Modern Footer */}
      <Box
        className="footer"
        sx={{
          background: 'linear-gradient(135deg, #2C2C2C 0%, #4A4A4A 100%)',
          color: 'white',
          py: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center" alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    background: 'linear-gradient(135deg, #D4AF37, #E6C866)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  She
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 2,
                    maxWidth: '400px',
                    mx: { xs: 'auto', md: 0 }
                  }}
                >
                  Votre destination beauté premium pour une expérience coiffure exceptionnelle
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem'
                  }}
                >
                  © 2025 She Salon. Tous droits réservés.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                <Button
                  variant="outlined"
                  size="large"
                  href="/rendez-vous"
                  endIcon={<ArrowForward />}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(212, 175, 55, 0.6)',
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    fontWeight: 500,
                    textTransform: 'none',
                    background: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: '#D4AF37',
                      background: 'rgba(212, 175, 55, 0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3)'
                    }
                  }}
                >
                  Réserver Maintenant
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
} 