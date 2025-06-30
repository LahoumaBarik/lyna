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
    <div className="services-page">
      <Box className="services-hero">
        <Container maxWidth="lg">
          <Box className="hero-content">
            <Typography variant="h1" className="hero-title">
              Nos Services
            </Typography>
            <Typography variant="h5" className="hero-subtitle">
              Découvrez notre gamme complète de services de coiffure professionnels
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" className="services-container">
        <Box className="categories-filter">
          <Typography variant="h6" className="filter-title">
            Filtrer par catégorie :
          </Typography>
          <Box className="filter-chips">
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                className={`filter-chip ${selectedCategory === category ? 'selected' : ''}`}
                variant={selectedCategory === category ? "filled" : "outlined"}
                onClick={() => handleCategoryClick(category)}
                clickable
              />
            ))}
          </Box>
        </Box>
        
        <Box className="detailed-view">
          <CardMedia
            component="img"
            image={currentCategoryData.image}
            alt={selectedCategory}
            className="category-hero-image"
          />
          <Typography variant="h4" className="accordion-category-title">
            {selectedCategory}
          </Typography>
          {currentCategoryData.items.map((item, itemIndex) => {
            const panelId = `panel-${itemIndex}`;
            return (
              <Accordion
                key={itemIndex}
                expanded={expanded === panelId}
                onChange={handleAccordionChange(panelId)}
                className="service-accordion"
              >
                <AccordionSummary
                  expandIcon={expanded === panelId ? <RemoveIcon /> : <AddIcon />}
                  aria-controls={`${panelId}-content`}
                  id={`${panelId}-header`}
                  className="accordion-summary"
                >
                  <Typography className="service-item-title">{item.title}</Typography>
                </AccordionSummary>
                <AccordionDetails className="accordion-details">
                  <ul className="price-list">
                    {item.prices.map((priceInfo, priceIndex) => (
                      <li key={priceIndex}>
                        <span className="level">{priceInfo.level}</span>: <span className="price">{priceInfo.price}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>

        <Box className="cta-section">
          <Typography variant="h4" className="cta-title">
            Prêt(e) à transformer votre look ?
          </Typography>
          <Typography variant="body1" className="cta-description">
            Prenez rendez-vous dès maintenant et laissez nos experts prendre soin de vous
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            className="cta-button"
            onClick={handleCTAClick}
          >
            Prendre Rendez-vous
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default Services; 