import React from "react";

export function SorteoCard({ sorteo, onEditarClick, onEliminarClick, onVerBoletoClick, onNavigateInfo}) {
  const isActivo = sorteo.estado === "Activo";
  

  return (
    <div className="max-w-3xs cursor-pointer min-w-3xs bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
    onClick={onNavigateInfo} >
      {/* Imagen */}
      <div className="w-full h-40 overflow-hidden">
        <img
          src={sorteo.imagen_url}
          alt={sorteo.titulo}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título */}
        <h3 className="h-15 text-lg font-semibold text-gray-800 mb-2">
          {sorteo.titulo}
        </h3>

        {/* Estado */}
        <span
          className={`
            inline-block px-3 py-1 text-sm font-bold rounded-full
            ${
              isActivo
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-700"
            }
          `}
        >
          {sorteo.estado}
        </span>

        {/* Acciones */}
        <div className="mt-4 flex justify-between items-center">
          {/* Editar | Ver boletos */}
          <div className="text-sm text-gray-500 font-medium flex gap-2">
            <button
              onClick={(e)=>{
                e.stopPropagation();
                onEditarClick();
              }}
              className="hover:text-gray-700 transition-colors"
            >
              Editar
            </button>
            <span>|</span>
            <button
              onClick={(e)=>{
                e.stopPropagation();
                onVerBoletoClick();
              }}
              className="hover:text-gray-700 transition-colors"
            >
              Ver boletos
            </button>
          </div>

          {/* Icono eliminar */}
          <button
            onClick={(e)=>{
              e.stopPropagation();
              onEliminarClick();
            }}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 
                  01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 
                  00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
