const { Disponibilite } = require('../models');

// Fonction utilitaire pour convertir le jour et l'heure en Date
const createDateFromDayAndTime = (jour, heure) => {
  const jourMap = {
    'lundi': 1,
    'mardi': 2,
    'mercredi': 3,
    'jeudi': 4,
    'vendredi': 5,
    'samedi': 6,
    'dimanche': 0
  };

  const now = new Date();
  const currentDay = now.getDay();
  const targetDay = jourMap[jour];
  
  // Calculer le nombre de jours à ajouter pour atteindre le jour cible
  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7; // Passer à la semaine suivante
  }

  // Créer la date cible
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysToAdd);
  
  // Définir l'heure
  const [hours, minutes] = heure.split(':');
  targetDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  
  return targetDate;
};

// Validate time format (HH:mm)
const isValidTimeFormat = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Compare two time strings (HH:mm format)
const isEndTimeAfterStartTime = (startTime, endTime) => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes > startMinutes;
};

// Ajouter une disponibilité (POST)
exports.ajouterDisponibilite = async (req, res) => {
  try {
    const { stylist, jour, heureDebut, heureFin } = req.body;
    
    // Validate required fields
    if (!stylist || !jour || !heureDebut || !heureFin) {
      return res.status(400).json({ 
        message: 'Tous les champs sont requis',
        missing: {
          stylist: !stylist,
          jour: !jour,
          heureDebut: !heureDebut,
          heureFin: !heureFin
        }
      });
    }

    // Validate stylist ID format
    if (!/^[0-9a-fA-F]{24}$/.test(stylist)) {
      return res.status(400).json({ 
        message: 'ID de styliste invalide'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(jour)) {
      return res.status(400).json({ 
        message: 'Format de date invalide. Utilisez YYYY-MM-DD'
      });
    }

    // Validate time formats
    if (!isValidTimeFormat(heureDebut)) {
      return res.status(400).json({ 
        message: 'Format d\'heure de début invalide. Utilisez HH:mm'
      });
    }

    if (!isValidTimeFormat(heureFin)) {
      return res.status(400).json({ 
        message: 'Format d\'heure de fin invalide. Utilisez HH:mm'
      });
    }

    // Validate that end time is after start time
    if (!isEndTimeAfterStartTime(heureDebut, heureFin)) {
      return res.status(400).json({ 
        message: 'L\'heure de fin doit être après l\'heure de début'
      });
    }

    // Convertir la date en UTC pour éviter les problèmes de fuseau horaire
    // Parse the date in local timezone to avoid timezone issues
    const [year, month, day] = jour.split('-').map(Number);
    const utcDate = new Date(year, month - 1, day, 0, 0, 0, 0); // Local time, not UTC
    
    console.log('📅 Creating availability:');
    console.log('Input date:', jour);
    console.log('Parsed date (local):', utcDate);
    
    // Validate that the date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (utcDate < today) {
      return res.status(400).json({ 
        message: 'Impossible de créer une disponibilité dans le passé'
      });
    }

    // Check for overlapping time slots for the same stylist on the same day
    const existingDisponibilites = await Disponibilite.find({
      stylist,
      jour: utcDate,
      isActive: true
    });

    for (const existing of existingDisponibilites) {
      const existingStart = existing.heureDebut;
      const existingEnd = existing.heureFin;
      
      // Check for overlap
      if (
        (heureDebut >= existingStart && heureDebut < existingEnd) ||
        (heureFin > existingStart && heureFin <= existingEnd) ||
        (heureDebut <= existingStart && heureFin >= existingEnd)
      ) {
        return res.status(400).json({ 
          message: `Ce créneau chevauche avec une disponibilité existante (${existingStart} - ${existingEnd})`
        });
      }
    }

    const disponibilite = new Disponibilite({
      stylist,
      jour: utcDate,
      heureDebut,
      heureFin
    });
    
    await disponibilite.save();
    res.status(201).json({ 
      message: 'Créneau ajouté avec succès', 
      disponibilite 
    });
  } catch (error) {
    // Log full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Add disponibilite error:', error.stack);
    }
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erreur de validation',
        errors: validationErrors
      });
    }
    
    if (error.name === 'CastError' && error.path === 'stylist') {
      return res.status(400).json({ 
        message: 'ID de styliste invalide'
      });
    }

    res.status(500).json({ 
      message: 'Erreur serveur lors de la création de la disponibilité', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};

// Lister les disponibilités (GET)
exports.listerDisponibilites = async (req, res) => {
  try {
    const { coiffeuseId } = req.params;
    const { date } = req.query; // ex: ?date=2024-07-25

    let filter = { isActive: true }; // Filter for active disponibilités by default for admin
    if (coiffeuseId) {
      // Pour la route client, on exige une date
      if (!date) {
        return res.status(400).json({ message: "La date est requise pour voir les disponibilités." });
      }
      
      // Fix timezone issue: Parse the date in local timezone, not UTC
      const [year, month, day] = date.split('-').map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0); // Local time
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999); // Local time

      console.log('🔍 Client availability request:');
      console.log('Requested date:', date);
      console.log('Start of day (local):', startOfDay);
      console.log('End of day (local):', endOfDay);

      filter = { 
        stylist: coiffeuseId, 
        isActive: true,
        jour: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      };
    }

    const disponibilites = await Disponibilite.find(filter).populate('stylist', 'firstName lastName');
    console.log('📋 Disponibilités found:', disponibilites.length);
    console.log('🔍 Filter used:', JSON.stringify(filter, null, 2));
    disponibilites.forEach(d => console.log('- ', d.jour, d.heureDebut, d.heureFin, 'Stylist:', d.stylist));
    
    res.json(disponibilites);
  } catch (error) {
    console.error('Error listing disponibilités:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Modifier une disponibilité (PUT)
exports.modifierDisponibilite = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // On s'assure que si la date est modifiée, elle est aussi en UTC
    if (updates.jour) {
      updates.jour = new Date(updates.jour + 'T00:00:00.000Z');
    }
    const dispo = await Disponibilite.findByIdAndUpdate(id, updates, { new: true });
    if (!dispo) return res.status(404).json({ message: 'Disponibilité non trouvée' });
    res.json({ message: 'Disponibilité modifiée avec succès', disponibilite: dispo });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer une disponibilité (DELETE)
exports.supprimerDisponibilite = async (req, res) => {
  try {
    const { id } = req.params;
    const dispo = await Disponibilite.findByIdAndDelete(id);
    if (!dispo) return res.status(404).json({ message: 'Disponibilité non trouvée' });
    res.json({ message: 'Disponibilité supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ===== STYLIST-SPECIFIC FUNCTIONS =====

// Lister les disponibilités d'un stylist (pour le stylist lui-même)
exports.listerMesDisponibilites = async (req, res) => {
  try {
    const stylistId = req.user._id;
    const { date } = req.query;

    let filter = { 
      stylist: stylistId, 
      isActive: true 
    };

    // Si une date est spécifiée, filtrer par date
    if (date) {
      const startOfDay = new Date(date + 'T00:00:00.000Z');
      const endOfDay = new Date(date + 'T23:59:59.999Z');
      filter.jour = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const disponibilites = await Disponibilite.find(filter)
      .populate('stylist', 'firstName lastName')
      .sort({ jour: 1, heureDebut: 1 });

    res.json({ disponibilites });
  } catch (error) {
    console.error('Error listing stylist disponibilités:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Ajouter une disponibilité (pour le stylist lui-même)
exports.ajouterMaDisponibilite = async (req, res) => {
  try {
    const stylistId = req.user._id;
    const { jour, heureDebut, heureFin } = req.body;
    
    // Validate required fields
    if (!jour || !heureDebut || !heureFin) {
      return res.status(400).json({ 
        message: 'Tous les champs sont requis',
        missing: {
          jour: !jour,
          heureDebut: !heureDebut,
          heureFin: !heureFin
        }
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(jour)) {
      return res.status(400).json({ 
        message: 'Format de date invalide. Utilisez YYYY-MM-DD'
      });
    }

    // Validate time formats
    if (!isValidTimeFormat(heureDebut)) {
      return res.status(400).json({ 
        message: 'Format d\'heure de début invalide. Utilisez HH:mm'
      });
    }

    if (!isValidTimeFormat(heureFin)) {
      return res.status(400).json({ 
        message: 'Format d\'heure de fin invalide. Utilisez HH:mm'
      });
    }

    // Validate that end time is after start time
    if (!isEndTimeAfterStartTime(heureDebut, heureFin)) {
      return res.status(400).json({ 
        message: 'L\'heure de fin doit être après l\'heure de début'
      });
    }

    // Validate that date is not in the past
    const selectedDate = new Date(jour + 'T00:00:00.000Z');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ 
        message: 'Impossible de créer une disponibilité dans le passé'
      });
    }

    // Check for overlapping availabilities
    const existingDispo = await Disponibilite.findOne({
      stylist: stylistId,
      jour: selectedDate,
      isActive: true,
      $or: [
        {
          heureDebut: { $lt: heureFin },
          heureFin: { $gt: heureDebut }
        }
      ]
    });

    if (existingDispo) {
      return res.status(400).json({ 
        message: 'Il existe déjà une disponibilité qui chevauche cette période'
      });
    }

    // Create the availability
    const disponibilite = new Disponibilite({
      stylist: stylistId,
      jour: selectedDate,
      heureDebut,
      heureFin,
      isActive: true
    });

    await disponibilite.save();

    res.status(201).json({ 
      message: 'Disponibilité ajoutée avec succès', 
      disponibilite 
    });
  } catch (error) {
    console.error('Add stylist disponibilite error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erreur de validation',
        errors: validationErrors
      });
    }

    res.status(500).json({ 
      message: 'Erreur serveur lors de la création de la disponibilité', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};

// Modifier une disponibilité (pour le stylist lui-même)
exports.modifierMaDisponibilite = async (req, res) => {
  try {
    const { id } = req.params;
    const stylistId = req.user._id;
    const updates = req.body;

    // Check if the availability belongs to the stylist
    const existingDispo = await Disponibilite.findOne({ _id: id, stylist: stylistId });
    if (!existingDispo) {
      return res.status(404).json({ message: 'Disponibilité non trouvée ou accès non autorisé' });
    }

    // Validate updates if provided
    if (updates.jour) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updates.jour)) {
        return res.status(400).json({ 
          message: 'Format de date invalide. Utilisez YYYY-MM-DD'
        });
      }
      updates.jour = new Date(updates.jour + 'T00:00:00.000Z');
    }

    if (updates.heureDebut && !isValidTimeFormat(updates.heureDebut)) {
      return res.status(400).json({ 
        message: 'Format d\'heure de début invalide. Utilisez HH:mm'
      });
    }

    if (updates.heureFin && !isValidTimeFormat(updates.heureFin)) {
      return res.status(400).json({ 
        message: 'Format d\'heure de fin invalide. Utilisez HH:mm'
      });
    }

    if (updates.heureDebut && updates.heureFin && !isEndTimeAfterStartTime(updates.heureDebut, updates.heureFin)) {
      return res.status(400).json({ 
        message: 'L\'heure de fin doit être après l\'heure de début'
      });
    }

    const dispo = await Disponibilite.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: 'Disponibilité modifiée avec succès', disponibilite: dispo });
  } catch (error) {
    console.error('Modify stylist disponibilite error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer une disponibilité (pour le stylist lui-même)
exports.supprimerMaDisponibilite = async (req, res) => {
  try {
    const { id } = req.params;
    const stylistId = req.user._id;

    // Check if the availability belongs to the stylist
    const existingDispo = await Disponibilite.findOne({ _id: id, stylist: stylistId });
    if (!existingDispo) {
      return res.status(404).json({ message: 'Disponibilité non trouvée ou accès non autorisé' });
    }

    const dispo = await Disponibilite.findByIdAndDelete(id);
    res.json({ message: 'Disponibilité supprimée avec succès' });
  } catch (error) {
    console.error('Delete stylist disponibilite error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}; 