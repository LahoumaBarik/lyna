import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginModal({ onAuthSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(formData);
      if (onAuthSuccess) onAuthSuccess(user);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur de connexion');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-modal-form">
      {error && <div className="typeform-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="typeform-input"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Mot de passe"
        value={formData.password}
        onChange={handleChange}
        className="typeform-input"
        required
      />
      <button type="submit" className="typeform-btn">Se connecter</button>
      <div className="login-modal-links">
        <Link to="/register">Créer un compte</Link>
        <Link to="/reset-password">Mot de passe oublié ?</Link>
      </div>
    </form>
  );
}

export default LoginModal; 