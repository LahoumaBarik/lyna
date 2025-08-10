import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { stylists as allStylists } from '../data/stylists'; // Import local data
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Grid, 
  List, 
  ListItem, 
  ListItemIcon,
  Card,
  CardContent,
  Avatar,
  Chip,
  Fade,
  Slide,
  IconButton
} from '@mui/material';
import {
  CheckCircleOutline,
  Star,
  ArrowBack,
  AutoAwesome,
  Verified,
  Palette,
  TipsAndUpdates
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StylistProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the stylist from the local array
    const currentStylist = allStylists.find(s => s._id === id);
    setStylist(currentStylist);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          background: 'linear-gradient(135deg, #FDFCFA 0%, #F8F6F2 50%, #F0EDE7 100%)'
        }}
      >
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (!stylist) {
    return (
      <Box 
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #FDFCFA 0%, #F8F6F2 50%, #F0EDE7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Container sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" sx={{ color: 'text.primary', mb: 2 }}>
            Styliste non trouvé
          </Typography>
          <IconButton onClick={() => navigate('/equipe')} sx={{ color: 'primary.main' }}>
            <ArrowBack />
          </IconButton>
        </Container>
      </Box>
    );
  }

  const {
    firstName,
    lastName,
    stylistInfo: {
      profilePicture,
      level,
      expertise,
      favoriteProducts,
      expertTip,
      inspiration,
      description
    }
  } = stylist;

  return (
    <Box className="stylist-profile-page">
      <Container className="profile-container">
        <Box className="stylist-name-header">
          <Typography component="span" className="stylist-main-name">{firstName} {lastName}</Typography>
          <Typography component="span" className="stylist-level-name">{level || 'Styliste'}</Typography>
        </Box>
        <Grid container spacing={5} className="profile-grid-container" columns={{ xs: 12, md: 12 }}>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
            <Box className="polaroid-wrapper">
              <img
                src={profilePicture || '/images/default-profile.png'}
                alt={`${firstName} ${lastName}`}
                className="polaroid-image"
              />
            </Box>
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
            <Box className="details-section">
              <Box className="detail-item">
                <Typography className="detail-title">Expertise</Typography>
                <Typography className="detail-text">
                  {expertise || 'Spécialisation non définie.'}
                </Typography>
              </Box>

              <Box className="detail-item">
                <Typography className="detail-title">Produits indispensables</Typography>
                {favoriteProducts && favoriteProducts.length > 0 ? (
                  <List>
                    {favoriteProducts.map((product, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemIcon sx={{ minWidth: '32px' }}><CheckCircleOutlineIcon fontSize="small" color="disabled"/></ListItemIcon>
                        <Typography className="detail-list-item">{product}</Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography className="detail-text">Aucun produit indispensable listé.</Typography>
                )}
              </Box>
              
              <Box className="detail-item">
                <Typography className="detail-title">Conseil d'expert</Typography>
                <Typography className="detail-text">
                  "{expertTip || 'Conseil à venir.'}"
                </Typography>
              </Box>

              <Box className="detail-item">
                <Typography className="detail-title">Inspiration</Typography>
                <Typography className="detail-text">
                  {inspiration || 'Inspiration non définie.'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StylistProfilePage; 