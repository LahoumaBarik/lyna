import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardMedia,
  Card,
  CardContent,
  Grid,
  Fade,
  Slide,
  Grow,
  IconButton,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  CalendarToday,
  AccessTime,
  Star,
  Euro,
  ArrowForward,
  AutoAwesome,
  Brush,
  ContentCut,
  Spa,
  ColorLens
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const detailedServiceData = {
  "Coupe": {
    image: "/images/image2.jpg",
    icon: <ContentCut sx={{ fontSize: 32 }} />,
    description: "Des coupes modernes et personnalisées qui révèlent votre style unique",
    gradient: 'linear-gradient(135deg, #8B7355 0%, #B5A593 100%)',
    items: [
      { 
        title: 'COUPE FEMME', 
        description: 'Coupe personnalisée selon votre morphologie et style de vie',
        duration: '45-60 min',
        prices: [
          { level: 'Nouveau Talent', price: '50€' }, 
          { level: 'Styliste', price: '60€' }, 
          { level: 'Expert', price: '70€' }, 
          { level: 'Senior', price: '80€' }, 
          { level: 'Master', price: '90€' }
        ] 
      },
      { 
        title: 'COUPE HOMME', 
        description: 'Coupe masculine moderne avec finitions soignées',
        duration: '30-45 min',
        prices: [
          { level: 'Styliste', price: '40€' }, 
          { level: 'Expert', price: '45€' }, 
          { level: 'Senior', price: '50€' }
        ] 
      },
      { 
        title: 'FRANGE', 
        description: 'Création ou retouche de frange adaptée à votre visage',
        duration: '15-20 min',
        prices: [{ level: 'Tous niveaux', price: '15€' }] 
      },
    ]
  },
  "Coloration": {
    image: "/images/back.jpg",
    icon: <ColorLens sx={{ fontSize: 32 }} />,
    description: "Colorations sur-mesure avec des produits premium pour un résultat éclatant",
    gradient: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
    items: [
      { 
        title: 'COLORATION RACINE', 
        description: 'Retouche racines pour un rendu naturel et uniforme',
        duration: '1h30-2h',
        prices: [
          { level: 'Académie', price: '65€' }, 
          { level: 'Nouveau Talent', price: '78€' }, 
          { level: 'Styliste', price: '83€' }, 
          { level: 'Expert', price: '93€' }, 
          { level: 'Senior', price: '98€' }, 
          { level: 'Master', price: '101€' }
        ] 
      },
      { 
        title: 'COLORATION GLOBALE', 
        description: 'Coloration complète avec techniques avancées',
        duration: '2h30-3h30',
        prices: [
          { level: 'Académie', price: '85€' }, 
          { level: 'Nouveau Talent', price: '95€' }, 
          { level: 'Styliste', price: '105€' }, 
          { level: 'Expert', price: '115€' }, 
          { level: 'Senior', price: '125€' }, 
          { level: 'Master', price: '135€' }
        ] 
      },
      { 
        title: 'BALAYAGE', 
        description: 'Technique de mèches pour un effet naturel et lumineux',
        duration: '3h-4h',
        prices: [
          { level: 'Nouveau Talent', price: '120€' }, 
          { level: 'Styliste', price: '130€' }, 
          { level: 'Expert', price: '140€' }, 
          { level: 'Senior', price: '150€' }, 
          { level: 'Master', price: '160€' }
        ] 
      },
      { 
        title: 'BALAYAGE CHEVEUX LONGS', 
        description: 'Balayage spécialisé pour cheveux longs avec finition experte',
        duration: '4h-5h',
        prices: [
          { level: 'Styliste', price: '150€' }, 
          { level: 'Expert', price: '160€' }, 
          { level: 'Senior', price: '170€' }, 
          { level: 'Master', price: '180€' }
        ] 
      },
    ]
  },
  "Lissage": {
    image: "/images/image7.jpg",
    icon: <AutoAwesome sx={{ fontSize: 32 }} />,
    description: "Traitements lissants professionnels pour des cheveux soyeux et disciplinés",
    gradient: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
    items: [
      { 
        title: 'LISSAGE BRÉSILIEN', 
        description: 'Traitement de lissage longue durée pour cheveux indisciplinés',
        duration: '3h-4h',
        prices: [
          { level: 'Expert', price: '250€' }, 
          { level: 'Senior', price: '300€' }, 
          { level: 'Master', price: '350€' }
        ] 
      },
      { 
        title: 'TRAITEMENT HYDRATANT', 
        description: 'Soin intensif pour nourrir et réparer les cheveux',
        duration: '1h-1h30',
        prices: [{ level: 'Tous niveaux', price: '75€' }] 
      },
    ]
  },
  "Soins": {
    image: "/images/image8.jpg",
    icon: <Spa sx={{ fontSize: 32 }} />,
    description: "Soins capillaires premium pour sublimer et protéger vos cheveux",
    gradient: 'linear-gradient(135deg, #B5A593 0%, #8B7355 100%)',
    items: [
      { 
        title: 'SOIN OLAPLEX', 
        description: 'Reconstruction et protection des cheveux abîmés',
        duration: '45min-1h',
        prices: [{ level: 'Tous niveaux', price: '50€' }] 
      },
      { 
        title: 'SOIN KÉRASTASE', 
        description: 'Soin haute couture adapté à votre type de cheveux',
        duration: '1h-1h15',
        prices: [{ level: 'Tous niveaux', price: '60€' }] 
      },
    ]
  },
  "Extensions": {
    image: "/images/image4.jpg",
    icon: <Brush sx={{ fontSize: 32 }} />,
    description: "Extensions professionnelles pour volume et longueur instantanés",
    gradient: 'linear-gradient(135deg, #D4AF37 0%, #8B7355 100%)',
    items: [
      { 
        title: 'CONSULTATION EXTENSIONS', 
        description: 'Conseil personnalisé pour choisir vos extensions',
        duration: '30min',
        prices: [{ level: 'Tous niveaux', price: 'Gratuit' }] 
      },
      { 
        title: 'POSE EXTENSIONS', 
        description: 'Pose professionnelle d\'extensions naturelles',
        duration: '2h-3h',
        prices: [{ level: 'Expert+', price: 'Sur devis' }] 
      },
    ]
  }
};

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState('Coupe');
  const [expandedPanel, setExpandedPanel] = useState(false);
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setExpandedPanel(false);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleCTAClick = () => {
    navigate('/rendez-vous');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDFCFA 0%, #F8F6F2 100%)' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #8B7355 0%, #6B5842 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <Slide direction="up" in timeout={800}>
              <Typography
                variant="overline"
                sx={{
                  fontSize: '1rem',
                  letterSpacing: '0.2em',
                  fontWeight: 600,
                  mb: 3,
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                NOS SERVICES
              </Typography>
            </Slide>
            <Slide direction="up" in timeout={1000}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  lineHeight: 1.1
                }}
              >
                Excellence & Créativité
              </Typography>
            </Slide>
            <Slide direction="up" in timeout={1200}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  mb: 4,
                  maxWidth: '600px',
                  mx: 'auto',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.4
                }}
              >
                Découvrez notre gamme complète de services coiffure, 
                conçus pour révéler votre beauté naturelle
              </Typography>
            </Slide>
            <Slide direction="up" in timeout={1400}>
              <Button
                variant="contained"
                size="large"
                onClick={handleCTAClick}
                endIcon={<CalendarToday />}
                sx={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #E6C866 100%)',
                  color: '#2C2C2C',
                  px: 6,
                  py: 2,
                  borderRadius: '50px',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #B8941F 0%, #D4AF37 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                Réserver Maintenant
              </Button>
            </Slide>
          </Box>
        </Container>
        
        {/* Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(/images/back.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.1,
            zIndex: 1
          }}
        />
      </Box>

      {/* Category Navigation */}
      <Box sx={{ py: 4, background: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {Object.keys(detailedServiceData).map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => handleCategoryClick(category)}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                sx={{
                  px: 3,
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(139, 115, 85, 0.2)'
                  },
                  ...(selectedCategory === category && {
                    background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(139, 115, 85, 0.3)'
                  })
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Service Details */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Service Image */}
            <Grid item xs={12} md={6}>
              <Slide direction="right" in timeout={800}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                  }}
                >
                  <img
                    src={detailedServiceData[selectedCategory].image}
                    alt={selectedCategory}
                    style={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'cover'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      width: 80,
                      height: 80,
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
                    {detailedServiceData[selectedCategory].icon}
                  </Box>
                </Box>
              </Slide>
            </Grid>

            {/* Service Information */}
            <Grid item xs={12} md={6}>
              <Slide direction="left" in timeout={1000}>
                <Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      background: detailedServiceData[selectedCategory].gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontSize: 'clamp(2rem, 4vw, 3rem)'
                    }}
                  >
                    {selectedCategory}
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'text.secondary',
                      mb: 4,
                      lineHeight: 1.6,
                      fontSize: '1.125rem'
                    }}
                  >
                    {detailedServiceData[selectedCategory].description}
                  </Typography>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCTAClick}
                    endIcon={<CalendarToday />}
                    sx={{
                      background: detailedServiceData[selectedCategory].gradient,
                      color: 'white',
                      px: 6,
                      py: 2,
                      borderRadius: '50px',
                      fontWeight: 600,
                      fontSize: '1.125rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)'
                      }
                    }}
                  >
                    Réserver ce service
                  </Button>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Service Items */}
      <Box sx={{ py: 8, background: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 6,
              color: 'text.primary'
            }}
          >
            Détails des prestations
          </Typography>

          <Grid container spacing={4}>
            {detailedServiceData[selectedCategory].items.map((item, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Grow in timeout={800 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F6F2 100%)',
                      border: '1px solid rgba(139, 115, 85, 0.1)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 16px 32px rgba(139, 115, 85, 0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: 'primary.main',
                          fontSize: '1.25rem'
                        }}
                      >
                        {item.title}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          mb: 3,
                          lineHeight: 1.6
                        }}
                      >
                        {item.description}
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Chip
                          icon={<AccessTime />}
                          label={item.duration}
                          sx={{
                            background: 'rgba(139, 115, 85, 0.1)',
                            color: 'primary.main',
                            fontWeight: 500
                          }}
                        />
                      </Box>

                      <Box>
                        {item.prices.map((price, priceIndex) => (
                          <Box
                            key={priceIndex}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 1,
                              borderBottom: priceIndex < item.prices.length - 1 ? '1px solid rgba(139, 115, 85, 0.1)' : 'none'
                            }}
                          >
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {price.level}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {price.price}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #8B7355 0%, #6B5842 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: 'white'
              }}
            >
              Prêt à transformer votre look ?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Réservez votre rendez-vous en ligne et laissez nos experts 
              prendre soin de votre beauté
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleCTAClick}
              endIcon={<CalendarToday />}
              sx={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #E6C866 100%)',
                color: '#2C2C2C',
                px: 8,
                py: 2.5,
                borderRadius: '50px',
                fontWeight: 600,
                fontSize: '1.25rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #B8941F 0%, #D4AF37 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              Réserver Maintenant
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Services; 