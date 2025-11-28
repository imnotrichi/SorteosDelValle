import React from 'react';
import { useNavigate } from 'react-router-dom';
import boletoIcon from '../assets/boletoLight.png';

export function SorteoCardCliente({ sorteo, onClick }) {
  const navigate = useNavigate();
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

        <div className="flex justify-end items-center gap-2 mb-3">
          <img
            src={boletoIcon}
            alt="Número"
            className="w-6 h-6"
          />
          <span className="text-2xl font-bold text-card-number-2">
            ${sorteo.precioNumero.toFixed(2)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/sorteo/${sorteo.id}/numeros`);
          }}
          className="w-full flex items-center justify-center rounded-lg h-11 px-4 bg-primary hover:bg-primary/90 text-text-light text-base font-bold transition-colors"
        >
          Ver números
        </button>
      </div>
    </div>
  );
}