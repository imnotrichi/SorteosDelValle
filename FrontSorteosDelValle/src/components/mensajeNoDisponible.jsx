import React from 'react';
import { useNavigate } from 'react-router-dom';

const SorteoNoDisponible = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-md w-full p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
          sentiment_dissatisfied
        </span>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Sorteo no disponible
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Lo sentimos, no pudimos encontrar la información de este sorteo.
        </p>
        
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-text-light rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default SorteoNoDisponible;