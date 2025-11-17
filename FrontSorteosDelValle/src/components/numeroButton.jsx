import React from 'react';

export function NumeroButton({ numero, estaSeleccionado, estaDisponible, onClick }) {
  return (
    <button
      onClick={() => estaDisponible && onClick(numero)}
      disabled={!estaDisponible}
      className={`
        flex items-center justify-center
        w-12 h-12 rounded-lg
        text-lg font-bold
        transition-all
        ${estaSeleccionado 
          ? 'bg-primary text-text-light shadow-md scale-105' 
          : estaDisponible
            ? 'bg-white text-gray-700 border border-gray-300 hover:border-primary hover:bg-primary/10'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }
      `}
    >
      {numero}
    </button>
  );
}