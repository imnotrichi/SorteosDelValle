import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SorteoNumerosCard({ sorteo }) {
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);

  const fechaFormateada = new Date(sorteo.fecha_realizacion).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const boletosApartados = sorteo.numeros ? sorteo.numeros.length : 0;
  const precioUnitario = parseFloat(sorteo.precio_numero || 0);
  const totalPagar = precioUnitario * boletosApartados;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow mb-4">
      <div className="flex flex-col md:flex-row">

        <div className="w-full md:w-1/3 h-48 md:h-auto relative">
          <img
            src={sorteo.imagen_url}
            alt={sorteo.titulo}
            className="w-full h-full object-cover"
          />
        </div>

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
                const id = sorteo.id_sorteo || sorteo.id;
                navigate(`/registrar-comprobante/${id}`);
              }}
              className="px-6 py-2.5 bg-[#D4D4D4] hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors text-sm"
            >
              Registrar comprobante de pago
            </button>
          </div>
        </div>

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

      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors group relative z-20"
      >
        <span className="text-gray-900 font-medium text-lg group-hover:text-primary transition-colors">
          {isExpanded ? 'Ocultar números' : `Ver números apartados (${boletosApartados})`}
        </span>
        <span className={`material-symbols-outlined text-gray-600 group-hover:text-primary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </div>

      <div 
        className={`bg-gray-50 border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 p-6' : 'max-h-0 opacity-0 p-0 border-none'}`}
      >
        {sorteo.numeros && sorteo.numeros.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {sorteo.numeros.map((item, index) => {
               let bgClass = "bg-white border-gray-300 text-gray-600";
               if (item.estado === 'PENDIENTE') bgClass = "bg-yellow-50 border-yellow-300 text-yellow-700";
               if (item.estado === 'PAGADO') bgClass = "bg-green-50 border-green-300 text-green-700";

               return (
                 <div 
                   key={index}
                   className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border-2 text-center shadow-sm ${bgClass}`}
                 >
                   <span className="font-bold text-lg">#{item.numero}</span>
                   <span className="text-[10px] font-bold uppercase">{item.estado}</span>
                 </div>
               );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center text-sm">No hay números registrados.</p>
        )}
      </div>

    </div>
  );
}