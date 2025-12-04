import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Función para decodificar el token sin librerías externas
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('usuario');

    if (!token || !storedUser) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }

    // Verificar fecha de expiración (exp está en segundos)
    const decodedToken = parseJwt(token);
    if (decodedToken && decodedToken.exp * 1000 < Date.now()) {
      logout(true); // True indica que fue por expiración automática
    } else {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  };

  // Verificamos el token cada vez que cambias de ruta
  useEffect(() => {
    checkToken();
  }, [location.pathname]);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    
    // Redirección por rol
    if (userData.tipoUsuario === 'organizador' || userData.rol === 'organizador') {
      navigate('/admin/misSorteos');
    } else {
      navigate('/');
    }
  };

  const logout = (isExpired = false) => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUser(null);
    setIsAuthenticated(false);
    
    if (isExpired) {
      setShowSessionModal(true);
    } else {
      navigate('/iniciar-sesion');
    }
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
    navigate('/iniciar-sesion');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      logout, 
      showSessionModal, 
      closeSessionModal 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);