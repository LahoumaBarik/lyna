import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import './Apropos.css';

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
    <Box className="apropos-page">
      <Container maxWidth="lg" className="apropos-container">
        {/* Section 1: Mission */}
        <Grid container spacing={8} className="section-spacing">
          <Grid item xs={12} md={6}>
            <Box className="text-content">
              <Typography variant="h2" className="section-title">
                À PROPOS
              </Typography>
              <Typography variant="body1" className="section-text">
                Notre mission consiste à élever l'art de la coiffure en offrant des services haut de gamme personnalisés et en valorisant les coiffeurs comme des artistes, pour des résultats parfaitement adaptés au mode de vie de chaque client.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <img src="/images/image6.jpg" alt="Salon intérieur" className="section-image" />
          </Grid>
        </Grid>

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