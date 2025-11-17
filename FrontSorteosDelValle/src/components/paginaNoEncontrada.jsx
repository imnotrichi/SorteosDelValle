import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderCliente from './headerCliente';
import Header from './header';

const PaginaNoEncontrada = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const esRutaAdmin = location.pathname.startsWith('/admin');

  const rutaInicio = esRutaAdmin ? '/admin/mis-sorteos' : '/';
  const textoBotonInicio = esRutaAdmin ? 'Ir a Mis Sorteos' : 'Ir al inicio';

  return (
    <div className="min-h-screen bg-background-light">
      {esRutaAdmin ? (
        <Header onNavigate={navigate} />
      ) : (
        <HeaderCliente onNavigate={navigate} userName="Ricardo" />
      )}

      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] px-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-text-light mb-2">404</h1>
          
          <h2 className="text-2xl font-bold text-text-light mb-4">
            Página no encontrada
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Parece que esta página no existe o ha sido movida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate(rutaInicio)} 
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-text-light font-bold rounded-lg transition-colors shadow-sm"
            >
              {textoBotonInicio}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaNoEncontrada;