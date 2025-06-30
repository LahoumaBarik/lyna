const mongoose = require('mongoose');

const disponibiliteSchema = new mongoose.Schema({
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jour: {
    type: Date,
    required: true,
  },
  heureDebut: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // Format HH:mm
  },
  heureFin: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // Format HH:mm
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Disponibilite = mongoose.model('Disponibilite', disponibiliteSchema);

module.exports = Disponibilite; 