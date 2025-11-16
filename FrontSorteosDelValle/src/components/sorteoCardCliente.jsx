import React from 'react';

export function SorteoCardCliente({ sorteo, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="w-full h-48 overflow-hidden">
        <img
          src={sorteo.imagen_url}
          alt={sorteo.titulo}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 min-h-[3.5rem] line-clamp-2">
          {sorteo.titulo}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary text-xl">
            sell
          </span>
          <span className="text-2xl font-bold text-gray-900">
            ${sorteo.precioNumero.toFixed(2)}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full flex items-center justify-center rounded-lg h-11 px-4 bg-primary hover:bg-primary/90 text-text-light text-sm font-bold transition-colors"
        >
          Ver boletos
        </button>
      </div>
    </div>
  );
}