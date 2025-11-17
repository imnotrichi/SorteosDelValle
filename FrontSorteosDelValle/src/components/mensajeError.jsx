import React from 'react';

const ErrorModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="relative w-full max-w-md p-4 mx-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl p-8 text-center flex flex-col items-center gap-6 border border-border-light dark:border-border-dark">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-red-500">
              error
            </span>
          </div>
          
          <h3 className="text-2xl font-bold text-text-light dark:text-text-dark">
            Error al crear el sorteo
          </h3>
          
          <p className="text-sm text-text-light/80 dark:text-text-dark/80">
            {message || 'Ha ocurrido un error inesperado.'}
          </p>
          
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary/90 text-text-dark text-base font-bold transition-colors shadow-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;