const { Reservation } = require('../models');
const paypal = require('@paypal/checkout-server-sdk');

// Configuration PayPal
let environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
let client = new paypal.core.PayPalHttpClient(environment);

exports.payerReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;
    if (!reservationId) {
      return res.status(400).json({ message: 'reservationId requis' });
    }
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation introuvable' });
    }
    reservation.status = 'payé';
    reservation.paiement = {
      ...reservation.paiement,
      status: 'complete'
    };
    await reservation.save();
    res.json({ message: 'Paiement confirmé, réservation mise à jour', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { reservationId, paypalOrderId, paypalPaymentId } = req.body;

    // Vérifier que la réservation existe
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation introuvable' });
    }

    // Vérifier le statut de la commande PayPal
    const request = new paypal.orders.OrdersGetRequest(paypalOrderId);
    const order = await client.execute(request);

    if (order.result.status === 'COMPLETED') {
      // Mettre à jour la réservation
      reservation.status = 'confirmee';
      reservation.paiement = {
        status: 'complete',
        paypalOrderId,
        paypalPaymentId,
        datePaiement: new Date()
      };
      await reservation.save();

      res.json({ 
        message: 'Paiement confirmé, réservation mise à jour',
        reservation 
      });
    } else {
      res.status(400).json({ 
        message: 'Le paiement n\'a pas été complété',
        status: order.result.status 
      });
    }
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la confirmation du paiement',
      error: error.message 
    });
  }
};

// Obtenir l'historique des paiements pour une coiffeuse
exports.getPaymentHistory = async (req, res) => {
  try {
    const { stylistId, startDate, endDate } = req.query;
    
    const query = {
      stylist: stylistId,
      'paiement.status': 'complete'
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const reservations = await Reservation.find(query)
      .populate('client', 'firstName lastName')
      .populate('service', 'name')
      .sort({ date: -1 });

    // Calculer les statistiques
    const stats = {
      totalRevenue: reservations.reduce((sum, r) => sum + r.montant, 0),
      totalAppointments: reservations.length,
      monthlyStats: {}
    };

    // Statistiques mensuelles
    reservations.forEach(reservation => {
      const month = reservation.date.toISOString().slice(0, 7); // Format: YYYY-MM
      if (!stats.monthlyStats[month]) {
        stats.monthlyStats[month] = {
          revenue: 0,
          appointments: 0
        };
      }
      stats.monthlyStats[month].revenue += reservation.montant;
      stats.monthlyStats[month].appointments += 1;
    });

    res.json({
      reservations,
      stats
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
}; 