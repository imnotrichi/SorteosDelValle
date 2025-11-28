import React from 'react';

export function ResumenCompraCard({ 
  precioNumero, 
  numerosSeleccionados, 
  total, 
  onApartar 
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
      <div className="bg-card-number rounded-lg p-4 mb-6">
        <p className="text-base font-medium text-white/80 mb-1">Precio por número</p>
        <p className="text-3xl font-bold text-white">
          ${precioNumero.toFixed(2)}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-text-light mb-4">Resumen</h3>
        <div className="bg-background-light rounded-lg p-4">
          <p className="text-base text-gray-600 mb-2">Números seleccionados:</p>
          {numerosSeleccionados.length > 0 ? (
            <p className="text-lg font-semibold text-text-light mb-4">
              {numerosSeleccionados.sort((a, b) => a - b).join(', ')}
            </p>
          ) : (
            <p className="text-base text-gray-400 mb-4 italic">
              Ningún número seleccionado
            </p>
          )}
          
          <div className="border-t border-border-light pt-4">
            <div className="flex justify-between items-center">
              <span className="text-base text-gray-600">Total:</span>
              <span className="text-2xl font-bold text-text-light">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onApartar}
        disabled={numerosSeleccionados.length === 0}
        className="w-full flex items-center justify-center rounded-lg h-12 px-4 bg-primary hover:bg-primary/90 text-text-light text-lg font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Apartar números
      </button>
    </div>
  );
}