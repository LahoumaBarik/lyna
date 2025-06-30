// Contrôleur Admin pour gérer services, coiffeuses, disponibilités

const Service = require('../models/Service');
const User = require('../models/User');
const Disponibilite = require('../models/Disponibilite');

// SERVICES
exports.createService = async (req, res) => {
  try {
    const { name, description, duration, price, category, stylist } = req.body;
    const service = new Service({ name, description, duration, price, category, stylist });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la création du service', error: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const service = await Service.findByIdAndUpdate(id, updates, { new: true });
    if (!service) return res.status(404).json({ message: 'Service non trouvé' });
    res.json(service);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la modification du service', error: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ message: 'Service non trouvé' });
    res.json({ message: 'Service supprimé' });
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la suppression du service', error: err.message });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate('stylist', 'firstName lastName stylistInfo');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// COIFFEUSES
exports.createCoiffeuse = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, stylistInfo } = req.body;
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: 'stylist',
      stylistInfo
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la création de la coiffeuse', error: err.message });
  }
};

exports.updateCoiffeuse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findOneAndUpdate({ _id: id, role: 'stylist' }, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'Coiffeuse non trouvée' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la modification de la coiffeuse', error: err.message });
  }
};

exports.deleteCoiffeuse = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOneAndDelete({ _id: id, role: 'stylist' });
    if (!user) return res.status(404).json({ message: 'Coiffeuse non trouvée' });
    res.json({ message: 'Coiffeuse supprimée' });
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la suppression de la coiffeuse', error: err.message });
  }
};

exports.getAllCoiffeuses = async (req, res) => {
  try {
    const coiffeuses = await User.find({ role: 'stylist' });
    res.json(coiffeuses);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// DISPONIBILITÉS
exports.createDisponibilite = async (req, res) => {
  try {
    const { stylist, jour, heureDebut, heureFin, pauseDejeuner } = req.body;
    const dispo = new Disponibilite({ stylist, jour, heureDebut, heureFin, pauseDejeuner });
    await dispo.save();
    res.status(201).json(dispo);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la création de la disponibilité', error: err.message });
  }
};

exports.updateDisponibilite = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const dispo = await Disponibilite.findByIdAndUpdate(id, updates, { new: true });
    if (!dispo) return res.status(404).json({ message: 'Disponibilité non trouvée' });
    res.json(dispo);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la modification de la disponibilité', error: err.message });
  }
};

exports.deleteDisponibilite = async (req, res) => {
  try {
    const { id } = req.params;
    const dispo = await Disponibilite.findByIdAndDelete(id);
    if (!dispo) return res.status(404).json({ message: 'Disponibilité non trouvée' });
    res.json({ message: 'Disponibilité supprimée' });
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la suppression de la disponibilité', error: err.message });
  }
};

exports.getAllDisponibilites = async (req, res) => {
  try {
    const dispos = await Disponibilite.find().populate('stylist', 'firstName lastName');
    res.json(dispos);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
}; 