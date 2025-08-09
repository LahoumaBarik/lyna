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
  Grow
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';
import './Services.css';

const detailedServiceData = {
  "Coupe": {
    image: "/images/image2.jpg",
    items: [
      { title: 'COUPE FEMME', prices: [{ level: 'Nouveau Talent', price: '50$' }, { level: 'Styliste', price: '60$' }, { level: 'Expert', price: '70$' }, { level: 'Senior', price: '80$' }, { level: 'Master', price: '90$' }] },
      { title: 'COUPE HOMME', prices: [{ level: 'Styliste', price: '40$' }, { level: 'Expert', price: '45$' }, { level: 'Senior', price: '50$' }] },
      { title: 'FRANGE', prices: [{ level: 'Tous', price: '15$' }] },
    ]
  },
  "Coloration": {
    image: "/images/back.jpg",
    items: [
      { title: 'COLORATION RACINE', prices: [{ level: 'Académie', price: '65$' }, { level: 'Nouveau Talent', price: '78$' }, { level: 'Styliste', price: '83$' }, { level: 'Expert', price: '93$' }, { level: 'Senior', price: '98$' }, { level: 'Master', price: '101$' }] },
      { title: 'COLORATION GLOBALE', prices: [{ level: 'Académie', price: '85$' }, { level: 'Nouveau Talent', price: '95$' }, { level: 'Styliste', price: '105$' }, { level: 'Expert', price: '115$' }, { level: 'Senior', price: '125$' }, { level: 'Master', price: '135$' }] },
      { title: 'BALAYAGE', prices: [{ level: 'Nouveau Talent', price: '120$' }, { level: 'Styliste', price: '130$' }, { level: 'Expert', price: '140$' }, { level: 'Senior', price: '150$' }, { level: 'Master', price: '160$' }] },
      { title: 'BALAYAGE CHEVEUX LONG', prices: [{ level: 'Styliste', price: '150$' }, { level: 'Expert', price: '160$' }, { level: 'Senior', price: '170$' }, { level: 'Master', price: '180$' }] },
    ]
  },
  "Lissage": {
    image: "/images/image7.jpg",
    items: [
      { title: 'LISSAGE BRÉSILIEN', prices: [{ level: 'Expert', price: '250$' }, { level: 'Senior', price: '300$' }, { level: 'Master', price: '350$' }] },
      { title: 'TRAITEMENT HYDRATANT', prices: [{ level: 'Tous', price: '75$' }] },
    ]
  },
  "Soins": {
    image: "/images/image8.jpg",
    items: [
      { title: 'SOIN OLAPLEX', prices: [{ level: 'Tous', price: '50$' }] },
      { title: 'SOIN KÉRASTASE', prices: [{ level: 'Tous', price: '60$' }] },
    ]
  },
  "Extensions": {
    image: "/images/image4.jpg",
    items: [
      { title: 'CONSULTATION EXTENSIONS', prices: [{ level: 'Tous', price: 'Gratuit' }] },
      { title: 'POSE BANDE ADHÉSIVE', prices: [{ level: 'Expert', price: 'Sur devis' }] },
    ]
  }
};

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState('Coloration');
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setExpanded(false);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  const handleCTAClick = () => {
    navigate('/reservation');
  };

  const categories = ["Coupe", "Coloration", "Lissage", "Soins", "Extensions"];
  const currentCategoryData = detailedServiceData[selectedCategory];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        className="services-hero fade-in"
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(212, 185, 150, 0.9) 0%, rgba(184, 160, 138, 0.9) 100%), url("/images/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Box className="hero-content">
            <Typography 
              variant="h1" 
              className="hero-title fade-in"
              sx={{
                color: '#2C2C2C',
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                letterSpacing: '-0.02em',
                marginBottom: 2,
                textShadow: '2px 2px 4px rgba(255, 255, 255, 0.3)'
              }}
            >
              Nos Services
            </Typography>
            <Typography 
              variant="h5" 
              className="hero-subtitle slide-in-up"
              sx={{
                color: '#2C2C2C',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                fontWeight: 400,
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6
              }}
            >
              Découvrez notre gamme complète de services de coiffure professionnels
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" className="services-container" sx={{ py: 6 }}>
        {/* Categories Filter */}
        <Box className="categories-filter" sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            className="filter-title fade-in"
            sx={{
              fontWeight: 600,
              color: '#2C2C2C',
              marginBottom: 2,
              textAlign: 'center'
            }}
          >
            Filtrer par catégorie :
          </Typography>
          <Box className="filter-chips" sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category, index) => (
              <Grow in timeout={500 + index * 100} key={category}>
                <Chip
                  label={category}
                  onClick={() => handleCategoryClick(category)}
                  className={selectedCategory === category ? 'selected-category' : ''}
                  sx={{
                    backgroundColor: selectedCategory === category ? '#D4B996' : '#F0EDE7',
                    color: selectedCategory === category ? '#2C2C2C' : '#6B6B6B',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: selectedCategory === category ? '#B8A08A' : '#E6E0D8',
                      transform: 'translateY(-2px)',
                      boxShadow: '0px 4px 12px rgba(44, 44, 44, 0.15)'
                    }
                  }}
                />
              </Grow>
            ))}
          </Box>
        </Box>

        {/* Services Content */}
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            {/* Image Column */}
            <Grid item xs={12} md={6}>
              <Fade in timeout={800}>
                <Card
                  className="card-hover"
                  sx={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)',
                    height: '100%',
                    minHeight: '400px'
                  }}
                >
                  <CardMedia
                    component="img"
                    image={currentCategoryData.image}
                    alt={selectedCategory}
                    sx={{
                      height: '100%',
                      minHeight: '400px',
                      objectFit: 'cover'
                    }}
                  />
                </Card>
              </Fade>
            </Grid>

            {/* Services List Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%' }}>
                {currentCategoryData.items.map((item, index) => (
                  <Grow in timeout={800 + index * 200} key={item.title}>
                    <Accordion
                      expanded={expanded === `panel${index}`}
                      onChange={handleAccordionChange(`panel${index}`)}
                      sx={{
                        marginBottom: 2,
                        borderRadius: '12px',
                        boxShadow: '0px 2px 8px rgba(44, 44, 44, 0.06)',
                        '&:before': {
                          display: 'none',
                        },
                        '&.Mui-expanded': {
                          margin: '16px 0',
                          boxShadow: '0px 8px 16px rgba(44, 44, 44, 0.12)',
                        },
                        backgroundColor: '#FFFFFF',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0px 8px 16px rgba(44, 44, 44, 0.12)',
                        }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={expanded === `panel${index}` ? <RemoveIcon /> : <AddIcon />}
                        sx={{
                          '& .MuiAccordionSummary-content': {
                            margin: '16px 0',
                          },
                          '& .MuiSvgIcon-root': {
                            color: '#D4B996',
                            fontSize: '1.5rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          },
                          '&:hover .MuiSvgIcon-root': {
                            color: '#B8A08A',
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#2C2C2C',
                            fontSize: '1.1rem'
                          }}
                        >
                          {item.title}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ paddingTop: 0 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {item.prices.map((price, priceIndex) => (
                            <Box
                              key={priceIndex}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: priceIndex < item.prices.length - 1 ? '1px solid rgba(212, 185, 150, 0.2)' : 'none',
                                '&:last-child': {
                                  borderBottom: 'none'
                                }
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#6B6B6B',
                                  fontWeight: 500
                                }}
                              >
                                {price.level}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: '#2C2C2C',
                                  fontWeight: 600,
                                  fontSize: '1.1rem'
                                }}
                              >
                                {price.price}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Grow>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Fade in timeout={1000}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #F8F6F2 0%, #F0EDE7 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: '#2C2C2C',
                  marginBottom: 2
                }}
              >
                Prêt à prendre rendez-vous ?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#6B6B6B',
                  fontSize: '1.1rem',
                  marginBottom: 3,
                  maxWidth: '500px',
                  margin: '0 auto 24px'
                }}
              >
                Réservez votre séance avec l'une de nos coiffeuses professionnelles
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleCTAClick}
                sx={{
                  background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                  color: '#2C2C2C',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  padding: '12px 32px',
                  borderRadius: '50px',
                  textTransform: 'none',
                  boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #B8A08A 0%, #A08F7A 100%)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0px 8px 32px rgba(166, 124, 82, 0.18)',
                  }
                }}
              >
                Prendre Rendez-Vous
              </Button>
            </Box>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
};

export default Services; 