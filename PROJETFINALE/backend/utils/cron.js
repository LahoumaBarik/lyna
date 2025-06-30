const cron = require('node-cron');
const { Reservation, User, Service } = require('../models');
const { sendMail } = require('./mailer');

// Toutes les 10 minutes, vérifie les réservations à rappeler (1h avant)
cron.schedule('*/10 * * * *', async () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // Cherche les réservations à venir dans 1h, non rappelées, payées
  const reservations = await Reservation.find({
    date: { $gte: now, $lte: oneHourLater },
    'paiement.status': 'complete',
    status: { $in: ['payé', 'confirmee'] },
    rappelEnvoye: { $ne: true }
  })
    .populate('client', 'email firstName lastName')
    .populate('stylist', 'email firstName lastName')
    .populate('service', 'name');

  for (const r of reservations) {
    // Email à la cliente
    if (r.client && r.client.email) {
      await sendMail({
        to: r.client.email,
        subject: 'Rappel de votre rendez-vous',
        text: `Bonjour ${r.client.firstName},\n\nCeci est un rappel pour votre rendez-vous "${r.service.name}" avec ${r.stylist.firstName} dans 1h.\nDate: ${r.date.toLocaleString()}\n\nMerci de votre confiance !`,
      });
    }
    // Email à la coiffeuse
    if (r.stylist && r.stylist.email) {
      await sendMail({
        to: r.stylist.email,
        subject: 'Rappel : rendez-vous à venir',
        text: `Bonjour ${r.stylist.firstName},\n\nVous avez un rendez-vous "${r.service.name}" avec ${r.client.firstName} dans 1h.\nDate: ${r.date.toLocaleString()}`,
      });
    }
    // Marque la réservation comme rappelée
    r.rappelEnvoye = true;
    await r.save();
  }
}); 