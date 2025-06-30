import React, { useState } from 'react';
import { Box, Typography, Button, Container, Accordion, AccordionSummary, AccordionDetails, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { stylists as allStylists } from '../data/stylists';
import './Equipe.css';

const levelsConfig = {
  'Senior / Master': {
    description: "Nos coiffeurs de niveau seniors et masters sont les experts pour transformer votre look et vous conseiller sur de nouveaux styles. Ils vous apportent confiance lors des transformations importantes et vous accompagnent tout au long de votre parcours capillaire, vous aidant à explorer et à trouver le style qui convient le mieux.\n\nAvec plus de 7 années d'expérience en salon, ils accompagnent également la relève et offrent du mentorat à nos apprentis."
  },
  'Styliste / Expert': {
    description: "Nos stylistes et experts possèdent une solide expérience et une maîtrise technique approfondie. Ils sont parfaits pour réaliser des coupes et des couleurs complexes, tout en vous guidant vers les tendances actuelles qui s'harmonisent avec votre style personnel."
  },
  'Nouveau Talent': {
    description: "Nos nouveaux talents sont des coiffeurs passionnés et récemment diplômés, supervisés par nos experts. Ils apportent une énergie nouvelle et des idées fraîches, idéales pour des services classiques et des mises à jour de style, à un prix plus accessible."
  },
  'Académie': {
    description: "L'académie est notre programme de formation interne où nos apprentis perfectionnent leur art. Participer à un service avec l'académie, c'est bénéficier d'un travail méticuleux sous la supervision de nos formateurs, tout en contribuant à la croissance de la prochaine génération de talents."
  }
};

const EquipePage = () => {
  const [stylists] = useState(allStylists);
  const navigate = useNavigate();

  const stylistsByLevel = stylists.reduce((acc, stylist) => {
    const level = stylist.stylistInfo?.level || 'Nouveau Talent';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(stylist);
    return acc;
  }, {});

  return (
    <Box className="equipe-page">
      {/* Hero Section */}
      <Box
        className="hero-section-equipe"
        sx={{ backgroundImage: "url('/images/equipe.jpg')" }}
      >
        <div className="hero-content-equipe">
          <Typography variant="h1" className="hero-title-equipe">
            NOS ARTISTES
          </Typography>
          <Button 
            variant="contained" 
            className="hero-button-equipe"
            onClick={() => navigate('/reservation')}
          >
            Prendre Rendez-Vous
          </Button>
        </div>
      </Box>

      {/* Main Content */}
      <Container maxWidth="md" className="main-content-equipe">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" className="section-heading-equipe">
                NIVEAUX & EXPÉRIENCE
            </Typography>
            <Typography variant="body1" className="section-subheading-equipe">
                Notre équipe regroupe des stylistes de tous niveaux, chacun expert dans des domaines variés de la coiffure, vous assurant de trouver l'artiste qui correspond parfaitement à vos besoins.
            </Typography>
        </Box>

        <Box className="accordion-container">
          {Object.keys(levelsConfig).map((level) => (
            stylistsByLevel[level] && stylistsByLevel[level].length > 0 && (
              <Accordion key={level} className="experience-accordion">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${level.replace(/\s/g, '-')}-content`}
                  id={`${level.replace(/\s/g, '-')}-header`}
                  className="accordion-summary"
                >
                  <Typography variant="h6" className="accordion-title">{level}</Typography>
                </AccordionSummary>
                <AccordionDetails className="accordion-details">
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                    {levelsConfig[level].description}
                  </Typography>
                  <Grid container spacing={4} columns={{ xs: 12, sm: 12, md: 12 }}>
                    {stylistsByLevel[level].map((stylist) => (
                      <Grid key={stylist._id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                        <Box 
                          className="stylist-card"
                          onClick={() => navigate(`/equipe/${stylist._id}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <img 
                            src={stylist.stylistInfo.profilePicture || '/images/default-profile.png'} 
                            alt={`${stylist.firstName} ${stylist.lastName}`}
                            className="stylist-card-image"
                          />
                          <Box className="stylist-card-content">
                            <Typography variant="h6" className="stylist-card-name">
                              {stylist.firstName} {stylist.lastName}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default EquipePage; 