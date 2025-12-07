import React from 'react';
import { useNavigate } from 'react-router-dom';

export function SorteoNumerosCard({ sorteo, onClick }) {
  const navigate = useNavigate();

  const fechaFormateada = new Date(sorteo.fecha_realizacion).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  //Dato simpulado
  const boletosApartados = sorteo.numeros_vendidos; 
  const totalPagar = sorteo.precioNumero * boletosApartados;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow mb-4"
    >
      {/* Sección Superior: Contenido Principal (Flex Row) */}
      <div className="flex flex-col md:flex-row">
        
        {/* 1. Imagen (Izquierda) */}
        <div className="w-full md:w-1/3 h-48 md:h-auto relative">
          <img
            src={sorteo.imagen_url}
            alt={sorteo.titulo}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 2. Información Central */}
        <div className="flex-1 p-6 flex flex-col justify-center">
          <span className="text-sm font-medium text-gray-900 mb-1">
            Tus números:
          </span>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
            {sorteo.titulo}
          </h3>
          
          <p className="text-gray-500 text-sm font-medium mb-6">
            Fecha del sorteo: {fechaFormateada}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("Pagar en línea");
              }}
              className="px-6 py-2.5 bg-primary hover:bg-[#42c974] text-gray-900 font-semibold rounded-md transition-colors text-sm shadow-sm"
            >
              Pagar en línea
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/registrar-comprobante/${sorteo.id}`);
              }}
              className="px-6 py-2.5 bg-[#D4D4D4] hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors text-sm"
            >
              Registrar comprobante de pago
            </button>
          </div>
        </div>

        {/* 3. Sección de Precio (Derecha) */}
        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-200 p-6 flex flex-col justify-center md:items-start bg-white">
          <span className="text-gray-900 font-medium mb-1">
            Total a pagar:
          </span>
          <span className="text-2xl font-bold text-gray-900 mb-1">
            ${totalPagar.toFixed(2)} MXN
          </span>
          <span className="text-gray-500 font-medium">
            {boletosApartados} boletos
          </span>
        </div>
      </div>

      {/* Sección Inferior: ver números */}
      <div 
        onClick={onClick}
        className="bg-white border-t border-gray-200 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-900 font-medium text-lg">
          Ver números apartados ({boletosApartados})
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={2.5} 
          stroke="currentColor" 
          className="w-6 h-6 text-gray-600"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}