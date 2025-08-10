import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Fade,
  Slide,
  Grow,
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  AutoAwesome,
  Star,
  Verified,
  TrendingUp,
  Work,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { stylists as allStylists } from '../data/stylists';

const levelsConfig = {
  'Senior / Master': {
    description: "Nos coiffeurs de niveau seniors et masters sont les experts pour transformer votre look et vous conseiller sur de nouveaux styles. Ils vous apportent confiance lors des transformations importantes et vous accompagnent tout au long de votre parcours capillaire, vous aidant à explorer et à trouver le style qui convient le mieux.\n\nAvec plus de 7 années d'expérience en salon, ils accompagnent également la relève et offrent du mentorat à nos apprentis.",
    color: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
    icon: <Star sx={{ fontSize: 32, color: '#D4AF37' }} />
  },
  'Styliste / Expert': {
    description: "Nos stylistes et experts possèdent une solide expérience et une maîtrise technique approfondie. Ils sont parfaits pour réaliser des coupes et des couleurs complexes, tout en vous guidant vers les tendances actuelles qui s'harmonisent avec votre style personnel.",
    color: 'linear-gradient(135deg, #B5A593 0%, #8B7355 100%)',
    icon: <Verified sx={{ fontSize: 32, color: '#8B7355' }} />
  },
  'Nouveau Talent': {
    description: "Nos nouveaux talents sont des coiffeurs passionnés et récemment diplômés, supervisés par nos experts. Ils apportent une énergie nouvelle et des idées fraîches, idéales pour des services classiques et des mises à jour de style, à un prix plus accessible.",
    color: 'linear-gradient(135deg, #D4AF37 0%, #B5A593 100%)',
    icon: <TrendingUp sx={{ fontSize: 32, color: '#D4AF37' }} />
  },
  'Académie': {
    description: "L'académie est notre programme de formation interne où nos apprentis perfectionnent leur art. Participer à un service avec l'académie, c'est bénéficier d'un travail méticuleux sous la supervision de nos formateurs, tout en contribuant à la croissance de la prochaine génération de talents.",
    color: 'linear-gradient(135deg, #B5A593 0%, #8B7355 100%)',
    icon: <Work sx={{ fontSize: 32, color: '#8B7355' }} />
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
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: "url('/images/equipe.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(44, 44, 44, 0.6)',
            zIndex: 1
          }
        }}
      >
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="h1" 
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                fontSize: { xs: '3rem', md: '4.5rem' },
                color: 'white',
                mb: 4,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              NOS ARTISTES
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/reservation')}
              sx={{
                background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '50px',
                boxShadow: '0 8px 24px rgba(139, 115, 85, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(139, 115, 85, 0.4)'
                }
              }}
            >
              Prendre Rendez-Vous
              <ArrowForward sx={{ ml: 1 }} />
            </Button>
          </Box>
        </Fade>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
        <Slide direction="up" in timeout={1200}>
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
              NIVEAUX & EXPÉRIENCE
            </Typography>
            <Typography 
              variant="h5" 
              sx={{
                color: 'text.secondary',
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 300
              }}
            >
              Notre équipe regroupe des stylistes de tous niveaux, chacun expert dans des domaines variés de la coiffure, vous assurant de trouver l'artiste qui correspond parfaitement à vos besoins.
            </Typography>
          </Box>
        </Slide>

        <Box sx={{ mb: 8 }}>
          {Object.keys(levelsConfig).map((level, index) => (
            stylistsByLevel[level] && stylistsByLevel[level].length > 0 && (
              <Grow in timeout={800 + index * 200} key={level}>
                <Accordion 
                  sx={{
                    mb: 3,
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 115, 85, 0.1)',
                    boxShadow: '0 16px 32px rgba(44, 44, 44, 0.08)',
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      margin: '16px 0'
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#8B7355' }} />}
                    aria-controls={`${level.replace(/\s/g, '-')}-content`}
                    id={`${level.replace(/\s/g, '-')}-header`}
                    sx={{
                      background: levelsConfig[level].color,
                      color: 'white',
                      '&:hover': {
                        background: levelsConfig[level].color,
                        opacity: 0.9
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {levelsConfig[level].icon}
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                        {level}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 4 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4, lineHeight: 1.8, color: 'text.secondary' }}>
                      {levelsConfig[level].description}
                    </Typography>
                    <Grid container spacing={3}>
                      {stylistsByLevel[level].map((stylist) => (
                        <Grid key={stylist._id} item xs={12} sm={6} md={4}>
                          <Card
                            onClick={() => navigate(`/equipe/${stylist._id}`)}
                            sx={{
                              cursor: 'pointer',
                              borderRadius: '16px',
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(139, 115, 85, 0.1)',
                              boxShadow: '0 8px 24px rgba(44, 44, 44, 0.06)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 16px 40px rgba(44, 44, 44, 0.12)',
                                background: 'rgba(255, 255, 255, 0.95)'
                              }
                            }}
                          >
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                              <Avatar
                                src={stylist.stylistInfo?.profilePicture || '/images/default-profile.png'}
                                alt={`${stylist.firstName} ${stylist.lastName}`}
                                sx={{
                                  width: 80,
                                  height: 80,
                                  mx: 'auto',
                                  mb: 2,
                                  border: '3px solid rgba(139, 115, 85, 0.2)'
                                }}
                              />
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                                {stylist.firstName} {stylist.lastName}
                              </Typography>
                              <Chip
                                label={stylist.stylistInfo?.level || 'Nouveau Talent'}
                                size="small"
                                sx={{
                                  background: levelsConfig[level].color,
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grow>
            )
          ))}
        </Box>

        {/* CTA Section */}
        <Slide direction="up" in timeout={1400}>
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Card
              sx={{
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 115, 85, 0.1)',
                boxShadow: '0 24px 48px rgba(44, 44, 44, 0.12)',
                overflow: 'hidden',
                p: 6
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <AutoAwesome sx={{ color: 'white', fontSize: 40 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Prêt à transformer votre look ?
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, maxWidth: '600px', mx: 'auto' }}>
                Réservez votre rendez-vous avec l'un de nos stylistes experts et découvrez la différence She
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/reservation')}
                sx={{
                  background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                  color: 'white',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: '50px',
                  boxShadow: '0 8px 24px rgba(139, 115, 85, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(139, 115, 85, 0.4)'
                  }
                }}
              >
                Réserver Maintenant
                <ArrowForward sx={{ ml: 1 }} />
              </Button>
            </Card>
          </Box>
        </Slide>
      </Container>
    </Box>
  );
};

export default EquipePage; 