import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '../config/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: true,
  socket: null,
  notifications: [],
  unreadCount: 0
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  SET_SOCKET: 'SET_SOCKET',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        loading: false
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };
    
    case AUTH_ACTIONS.TOKEN_REFRESHED:
      return {
        ...state,
        token: action.payload.accessToken,
        refreshToken: action.payload.refreshToken
      };
    
    case AUTH_ACTIONS.SET_SOCKET:
      return {
        ...state,
        socket: action.payload
      };
    
    case AUTH_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    
    case AUTH_ACTIONS.UPDATE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload.id
            ? { ...notif, ...action.payload.updates }
            : notif
        ),
        unreadCount: action.payload.updates.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount
      };
    
    case AUTH_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload
      };
    
    case AUTH_ACTIONS.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload
      };
    
    case AUTH_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios defaults and interceptors
  useEffect(() => {
    // Set base URL for axios
    axios.defaults.baseURL = API_BASE_URL;
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with better loop protection
    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token = null) => {
      failedQueue.forEach(prom => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });
      
      failedQueue = [];
    };

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Skip refresh for refresh token endpoint to prevent infinite loop
        if (originalRequest.url?.includes('/auth/refresh-token')) {
          return Promise.reject(error);
        }
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axios(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axios.post('/auth/refresh-token', {
                refreshToken
              });
              
              if (response.data.success && response.data.data) {
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                
                // Update tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                dispatch({
                  type: AUTH_ACTIONS.TOKEN_REFRESHED,
                  payload: { accessToken, refreshToken: newRefreshToken }
                });
                
                processQueue(null, accessToken);
                
                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axios(originalRequest);
              } else {
                throw new Error('Invalid refresh response');
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              processQueue(refreshError, null);
              logout();
              toast.error('Session expired. Please login again.');
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            // No refresh token available
            logout();
            toast.error('Session expired. Please login again.');
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Initialize socket connection
  const initializeSocket = (token) => {
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      dispatch({ type: AUTH_ACTIONS.SET_SOCKET, payload: socket });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      dispatch({ type: AUTH_ACTIONS.SET_SOCKET, payload: null });
    });

    // Handle real-time notifications
    socket.on('new_notification', (notification) => {
      dispatch({ type: AUTH_ACTIONS.ADD_NOTIFICATION, payload: notification });
      
      // Show toast notification
      toast.success(notification.title, {
        duration: 4000,
        position: 'top-right'
      });
    });

    socket.on('notification_updated', (data) => {
      dispatch({
        type: AUTH_ACTIONS.UPDATE_NOTIFICATION,
        payload: { id: data.id, updates: data }
      });
    });

    socket.on('appointment_status_changed', (data) => {
      toast.info(`Appointment status updated: ${data.status}`, {
        duration: 3000
      });
    });

    socket.on('system_announcement', (announcement) => {
      toast.info(announcement.message, {
        duration: 6000,
        icon: '📢'
      });
    });

    return socket;
  };

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await axios.post('/auth/login', credentials);
      
      if (response.data.code === 'LOGIN_SUCCESS' && response.data.data) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Update state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { accessToken, refreshToken, user }
        });
        
        // Initialize socket
        initializeSocket(accessToken);
        
        // Show success message
        toast.success(`Welcome back, ${user.firstName}!`);
        
        return { success: true, user };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        code: error.response?.data?.code
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await axios.post('/auth/register', userData);
      
      if (response.data.code === 'REGISTRATION_SUCCESS') {
        toast.success(response.data.data.message);
        
        // Automatically log in the user after successful registration
        try {
          const loginResponse = await axios.post('/auth/login', {
            email: userData.email,
            password: userData.password
          });
          
          if (loginResponse.data.code === 'LOGIN_SUCCESS' && loginResponse.data.data) {
            const { accessToken, refreshToken, user } = loginResponse.data.data;
            
            // Store tokens
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            // Update state
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { accessToken, refreshToken, user }
            });
            
            // Initialize socket
            initializeSocket(accessToken);
            
            // Show welcome message
            toast.success(`Welcome to our salon, ${user.firstName}!`);
            
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            return { 
              success: true, 
              message: response.data.data.message,
              user: user,
              autoLogin: true 
            };
          }
        } catch (loginError) {
          console.error('Auto-login after registration failed:', loginError);
          // Registration succeeded but auto-login failed, still return success
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          return { 
            success: true, 
            message: response.data.data.message + ' Please log in manually.',
            autoLogin: false 
          };
        }
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        details: error.response?.data?.details
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      if (state.token) {
        await axios.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clean up regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Disconnect socket
      if (state.socket) {
        state.socket.disconnect();
      }
      
      // Update state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      toast.success('Logged out successfully');
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/auth/profile', userData);
      
      if (response.data.code === 'PROFILE_UPDATE_SUCCESS') {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: response.data.data
        });
        
        toast.success('Profile updated successfully');
        return { success: true, user: response.data.data };
      } else {
        throw new Error(response.data.message || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      if (response.data.success) {
        dispatch({
          type: AUTH_ACTIONS.SET_NOTIFICATIONS,
          payload: response.data.data.notifications
        });
        dispatch({
          type: AUTH_ACTIONS.SET_UNREAD_COUNT,
          payload: response.data.data.unreadCount
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.patch(`/notifications/${notificationId}/read`);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_NOTIFICATION,
        payload: { id: notificationId, updates: { read: true } }
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await axios.patch('/notifications/mark-all-read');
      
      const updatedNotifications = state.notifications.map(notif => ({
        ...notif,
        read: true
      }));
      
      dispatch({
        type: AUTH_ACTIONS.SET_NOTIFICATIONS,
        payload: updatedNotifications
      });
      dispatch({
        type: AUTH_ACTIONS.SET_UNREAD_COUNT,
        payload: 0
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      try {
        const response = await axios.get('/auth/me');
        
        if (response.data.code === 'USER_DATA_SUCCESS' && response.data.data) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              accessToken: token,
              refreshToken: localStorage.getItem('refreshToken'),
              user: response.data.data
            }
          });
          
          // Initialize socket
          initializeSocket(token);
          
          // Fetch notifications
          fetchNotifications();
        } else {
          throw new Error('Invalid user data');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    };

    checkAuth();
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 