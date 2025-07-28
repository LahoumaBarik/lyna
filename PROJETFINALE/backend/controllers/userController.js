const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const updates = {};
    
    // Basic user fields
    ['firstName', 'lastName', 'email', 'phone'].forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Handle stylistInfo updates for stylists
    if (req.body.stylistInfo && req.user.role === 'stylist') {
      // Initialize stylistInfo if it doesn't exist
      if (!updates.stylistInfo) {
        updates.stylistInfo = {};
      }

      // Update stylistInfo fields
      const stylistFields = ['description', 'specializations', 'experience', 'level', 'expertise', 'inspiration', 'expertTip', 'favoriteProducts', 'socialMedia', 'workingHours', 'commission'];
      
      stylistFields.forEach(field => {
        if (req.body.stylistInfo[field] !== undefined) {
          if (!updates.stylistInfo) updates.stylistInfo = {};
          updates.stylistInfo[field] = req.body.stylistInfo[field];
        }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    
    res.json({
      message: 'Profil mis à jour avec succès',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erreur de validation',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}; 