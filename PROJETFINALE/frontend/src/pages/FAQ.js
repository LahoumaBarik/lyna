import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Card,
  CardContent,
  Fade,
  Slide
} from '@mui/material';
import {
  ExpandMore,
  Help,
  AutoAwesome,
  Eco,
  TipsAndUpdates
} from '@mui/icons-material';

const faqData = {
  essentialInfo: [
    { 
      title: 'Prépare tes inspirations', 
      content: 'La communication est essentielle. Les photos offrent une explication visuelle de la coiffure dont vous rêvez, assurant que vous et votre styliste soyez en parfaite harmonie. Lors de votre recherche de visuels, assurez-vous de trouver des photos qui ressemblent à votre texture de cheveux. Ça permet d\'éviter les malentendus, de lancer des discussions et d\'exprimer des détails que les mots ne peuvent parfois pas expliquer.'
    },
    { title: 'Stationnement', content: 'Un stationnement payant est disponible dans la rue et un stationnement public se trouve à proximité du salon. Prévoyez arriver quelques minutes à l\'avance pour trouver une place.' },
    { title: 'État des cheveux', content: 'Veuillez arriver avec les cheveux propres et secs, démêlés et dans leur état le plus naturel possible. Cela nous permet d\'évaluer au mieux votre texture et de commencer le travail sans délai.' },
    { title: 'Politique d\'annulation', content: 'Nous demandons un préavis de 48 heures pour toute annulation ou modification de rendez-vous. Les annulations tardives ou les non-présentations pourront entraîner des frais équivalents à 50% du service réservé.' },
  ],
  toKnow: [
    { title: 'Protéger vos cheveux des fers et de la chaleur', content: 'L\'utilisation excessive d\'outils chauffants peut endommager vos cheveux. Appliquez toujours un protecteur thermique avant le séchage ou le coiffage pour préserver leur santé et leur brillance.' },
    { title: 'Utilisation du Shampoing Sec', content: 'Le shampoing sec est un excellent moyen de rafraîchir votre coiffure entre les lavages. Vaporisez à la racine, laissez agir une minute, puis massez ou brossez pour absorber l\'excès de sébum.' },
  ]
};

const FAQPage = () => {
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
                mb: 2
              }}
            >
              TOUT CE QU'IL FAUT SAVOIR
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                fontWeight: 300,
                mb: 6
              }}
            >
              La référence She
            </Typography>
          </Box>
        </Fade>

        {/* Header Section */}
        <Slide direction="up" in timeout={1000}>
          <Grid container spacing={6} alignItems="center" sx={{ mb: 8 }}>
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
                <CardContent sx={{ p: { xs: 4, md: 6 }, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Box sx={{ textAlign: 'center' }}>
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
                      <Help sx={{ color: 'white', fontSize: 40 }} />
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 2
                      }}
                    >
                      Guide Complet
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '1.125rem',
                        lineHeight: 1.6
                      }}
                    >
                      Toutes les informations essentielles pour une expérience parfaite chez She
                    </Typography>
                  </Box>
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
                  src="/images/faq.jpg" 
                  alt="Salon" 
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

        {/* Accordions Section */}
        <Box className="faq-section">
          <Typography variant="h4" className="faq-section-title">
            INFORMATIONS ESSENTIELLES
            <span className="faq-section-subtitle">Pour ton premier rendez-vous.</span>
          </Typography>
          {faqData.essentialInfo.map((item, index) => (
            <Accordion key={index} className="faq-accordion">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography className="faq-accordion-title">{item.title}</Typography></AccordionSummary>
              <AccordionDetails><Typography className="faq-accordion-content">{item.content}</Typography></AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box className="faq-section">
          <Typography variant="h4" className="faq-section-title">
            À SAVOIR
            <span className="faq-section-subtitle">Entretien de tes cheveux au quotidien.</span>
          </Typography>
          {faqData.toKnow.map((item, index) => (
            <Accordion key={index} className="faq-accordion">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography className="faq-accordion-title">{item.title}</Typography></AccordionSummary>
              <AccordionDetails><Typography className="faq-accordion-content">{item.content}</Typography></AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Green Circle Section */}
        <Box className="faq-section">
            <Typography variant="h4" className="faq-section-title">
                GREEN CIRCLE
                <span className="faq-section-subtitle">Programme de recyclage exclusif conçu pour les salons.</span>
            </Typography>
            <Grid container spacing={5} alignItems="center" className="green-circle-container" columns={{ xs: 12, md: 12 }}>
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 5' } }}>
                    <img src="/images/faq1.jpg" alt="Initiative Éco-Responsable" className="green-circle-image" />
                </Grid>
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 7' } }}>
                    <Box className="green-circle-content">
                        <Typography variant="h3" className="green-circle-title">Initiative Éco-Responsable</Typography>
                        <Typography className="green-circle-text">
                            She est fier de faire partie des Salons Green Circle, un programme qui recycle jusqu'à 95 % des déchets de coiffure, comme les cheveux, papiers d'aluminium et produits chimiques, pour réduire notre impact environnemental.
                        </Typography>
                        <Box className="green-circle-contribution">
                            <Typography className="green-circle-item">Frais de 2$</Typography>
                            <Typography className="green-circle-item">Notre contribution</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>

      </Container>
    </Box>
  );
};

export default FAQPage; 