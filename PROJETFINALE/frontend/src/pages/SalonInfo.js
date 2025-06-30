import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SalonInfo.css';

const horaires = [
  { jour: 'Lundi', heures: '09:00 - 17:00' },
  { jour: 'Mardi', heures: '09:00 - 18:00' },
  { jour: 'Mercredi', heures: '09:00 - 19:00' },
  { jour: 'Jeudi', heures: '09:00 - 19:00' },
  { jour: 'Vendredi', heures: '09:00 - 18:00' },
  { jour: 'Samedi', heures: '09:00 - 16:00' },
  { jour: 'Dimanche', heures: 'Fermé' },
];

export default function SalonInfo() {
  const navigate = useNavigate();
  return (
    <div className="salon-bg-gradient">
      <div className="salon-glass-card animate-fade-in">
        <h1 className="salon-title">She</h1>
        <div className="salon-welcome">Bienvenue</div>
        <div className="salon-contact-list">
          <div className="salon-contact-item">
            <span className="salon-icon pin" />
            1234 rue saint-catherine, Montréal QC
          </div>
          <div className="salon-contact-item">
            <span className="salon-icon phone" />
            (514) 123-4567
          </div>
          <div className="salon-contact-item">
            <span className="salon-icon mail" />
            contact@she.co
          </div>
        </div>
        <div className="salon-hours-block">
          {horaires.map(h => (
            <div className="salon-hours-row" key={h.jour}>
              <span className="salon-hours-day">{h.jour}</span>
              <span className={h.heures === 'Fermé' ? 'salon-hours-closed' : 'salon-hours-time'}>{h.heures}</span>
            </div>
          ))}
        </div>
        <button className="salon-btn" onClick={() => navigate('/coiffeuses')}>
          Prendre un rendez-vous
        </button>
      </div>
    </div>
  );
} 