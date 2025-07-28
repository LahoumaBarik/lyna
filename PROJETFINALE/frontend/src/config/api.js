// API Configuration
const getApiUrl = () => {
  // In production, use the same domain (backend serves frontend)
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  
  // In development, use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

export const API_URL = getApiUrl();
export const API_BASE_URL = `${API_URL}/api`;

// Socket.IO configuration
export const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

// Environment detection
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'; 