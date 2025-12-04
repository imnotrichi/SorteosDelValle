import React from 'react';

const SessionExpiredModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <span className="material-symbols-outlined text-3xl text-red-600">
              timer_off
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Sesión Expirada
          </h3>
          <p className="text-gray-600 mb-6">
            Tu sesión ha terminado por seguridad. Por favor, inicia sesión nuevamente para continuar.
          </p>

          <button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors"
          >
            Entendido, ir al login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;