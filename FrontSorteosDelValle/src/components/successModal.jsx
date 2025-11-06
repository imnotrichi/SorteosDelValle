import React from 'react';

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-4 mx-4">
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-8 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
          </div>
          <h3 className="text-2xl font-bold">
            ¡El sorteo se ha creado con éxito!
          </h3>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center rounded-lg h-12 px-6 bg-primary text-text-light text-base font-bold hover:opacity-90"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
export default SuccessModal;