import React from 'react';
import { Box, Container, Typography, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './FAQ.css';

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
    <Box className="faq-page">
      <Container maxWidth="lg" className="faq-container">
        {/* Header Section */}
        <Grid container spacing={8} alignItems="center" className="faq-section" columns={{ xs: 12, md: 12 }}>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Typography variant="h1" className="faq-main-title">
              TOUT CE QU'IL FAUT SAVOIR
            </Typography>
            <Typography variant="h5" className="faq-subtitle">
              La référence She
            </Typography>
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <img src="/images/faq.jpg" alt="Salon" className="faq-header-image" />
          </Grid>
        </Grid>

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