import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="relative w-full max-w-md p-4 mx-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl p-8 text-center flex flex-col items-center gap-6 border border-border-light dark:border-border-dark">
          
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-yellow-600">
              warning
            </span>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold text-text-light dark:text-text-dark">
              {title || '¿Estás seguro?'}
            </h3>
            
            <p className="text-sm text-text-light/80 dark:text-text-dark/80">
              {message || 'Se perderán los cambios no guardados.'}
            </p>
          </div>
          
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center rounded-lg h-12 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 text-base font-bold transition-colors shadow-sm">
              No, volver
            </button>
            
            <button
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center rounded-lg h-12 px-4 bg-red-500 hover:bg-red-600 text-white text-base font-bold transition-colors shadow-sm">
              Sí, cancelar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;