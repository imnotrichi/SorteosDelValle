import React, { useState, useMemo } from 'react';

export function ResumenLiberacion({ numerosSeleccionados, clientesAgrupados, onLiberar }) {
  
  const [ordenarPor, setOrdenarPor] = useState('numero');

  const listaOrdenada = useMemo(() => {
    const lista = [...clientesAgrupados];
    if (ordenarPor === 'fecha') {
      return lista.sort((a, b) => a.fechaRaw - b.fechaRaw);
    } else {
      return lista.sort((a, b) => a.numero - b.numero);
    }
  }, [clientesAgrupados, ordenarPor]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen de liberación</h3>
      <p className="text-sm text-gray-600 mb-4">Detalles de los números seleccionados</p>
      
      <div className="flex justify-end mb-4">
         <select 
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
            className="text-xs border border-gray-300 rounded bg-white text-gray-600 py-1 px-2 focus:outline-none focus:border-gray-400 cursor-pointer"
         >
            <option value="numero">Orden: Número</option>
            <option value="fecha">Orden: Fecha</option>
         </select>
      </div>
      
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto custom-scrollbar">
        {listaOrdenada.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Ningún número seleccionado
          </p>
        ) : (
          listaOrdenada.map((cliente) => (
            <div key={cliente.numero} className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  {cliente.numero}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{cliente.nombre}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-800 font-medium truncate ml-2" title={cliente.email}>{cliente.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Apartado:</span>
                  <span className="text-gray-800 font-medium">{cliente.fecha}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onLiberar}
        disabled={numerosSeleccionados.length === 0}
        className="w-full flex items-center justify-center rounded-lg h-12 px-4 bg-red-500 hover:bg-red-600 text-white text-lg font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Liberar {numerosSeleccionados.length} número{numerosSeleccionados.length !== 1 ? 's' : ''}
      </button>
    </div>
  );
}