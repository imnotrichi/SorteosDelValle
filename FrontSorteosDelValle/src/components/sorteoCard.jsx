import React from "react";

export function SorteoCard({ sorteo, onEditarClick, onEliminarClick, onVerBoletoClick, onNavigateInfo}) {
  const isActivo = sorteo.estado === "Activo";

  const getBadgeStyle = (estado) => {
    switch (estado) {
      case "Activo":
        return "bg-green-500 text-white";
      case "Próximamente":
        return "bg-blue-500 text-white";
      case "Finalizado":
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onNavigateInfo}
    >
      {/* Imagen */}
      <div className="w-full h-48 overflow-hidden relative">
        <img
          src={sorteo.imagen_url}
          alt={sorteo.titulo}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Badge de estado sobre la imagen */}
        <div className="absolute top-3 right-3">
          <span
            className={`
              inline-block px-3 py-1 text-xs font-bold rounded-full shadow-md
              ${getBadgeStyle(sorteo.estado)} 
            `}
          >
            {sorteo.estado}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título */}
        <h3 className="text-lg font-semibold text-text-light mb-3 min-h-[3.5rem] line-clamp-2">
          {sorteo.titulo}
        </h3>

        {/* Acciones principales */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditarClick();
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg h-9 px-3 bg-background-status hover:bg-green-400 text-text-light text-sm font-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Editar
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVerBoletoClick();
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg h-9 px-3 bg-blue-300 hover:bg-blue-400 text-text-light text-sm font-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Números
          </button>
        </div>

        {/* Botón eliminar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEliminarClick();
          }}
          className="w-full flex items-center justify-center gap-2 rounded-lg h-9 px-3 bg-red-50 hover:bg-red-300 text-red-600 text-sm font-medium transition-colors border border-red-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Eliminar sorteo
        </button>
      </div>
    </div>
  );
}