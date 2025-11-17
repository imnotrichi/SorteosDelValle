import React, { useState } from 'react';
import { NumeroButton } from '../components/numeroButtonApartado.jsx';
import { ResumenLiberacion } from '../components/resumenLiberacion.jsx';

// Componente principal
export default function LiberarNumerosUI() {
  const [busqueda, setBusqueda] = useState('');
  const [numerosSeleccionados, setNumerosSeleccionados] = useState([]);

  // Datos de ejemplo basados en tu JSON
  const numerosApartados = [
    { numero: 5, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:45:28.000Z" },
    { numero: 6, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:45:28.000Z" },
    { numero: 7, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:45:28.000Z" },
    { numero: 4, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:46:22.000Z" },
    { numero: 8, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:46:22.000Z" },
    { numero: 9, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:46:22.000Z" },
    { numero: 10, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:47:33.000Z" },
    { numero: 11, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:47:33.000Z" },
    { numero: 12, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:47:33.000Z" },
    { numero: 13, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:47:41.000Z" },
    { numero: 14, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:47:41.000Z" },
    { numero: 15, nombre_cliente: "Ricardo Alan Gutierrez", correo_cliente: "ricardo@example.com", fecha_apartado: "2025-11-17T17:47:41.000Z" }
  ];

  const handleSeleccionarNumero = (numero) => {
    if (numerosSeleccionados.includes(numero)) {
      setNumerosSeleccionados(numerosSeleccionados.filter(n => n !== numero));
    } else {
      setNumerosSeleccionados([...numerosSeleccionados, numero]);
    }
  };

  //solo los acomoda 
  const todosLosNumeros = numerosApartados
    .map(n => n.numero)
    .sort((a, b) => a - b);

  const numerosFiltrados = todosLosNumeros.filter(numero => {
    const estaApartado = numerosApartados.some(n => n.numero === numero);
    const coincideBusqueda = !busqueda || numero.toString().includes(busqueda);
    return estaApartado && coincideBusqueda;
  });

  const clientesAgrupados = numerosSeleccionados.map(numero => {
    const info = numerosApartados.find(n => n.numero === numero);
    return {
      numero,
      nombre: info?.nombre_cliente || '',
      email: info?.correo_cliente || '',
      fecha: info ? new Date(info.fecha_apartado).toLocaleDateString() : ''
    };
  }).sort((a, b) => a.numero - b.numero);

  return (
    <div className="min-h-screen bg-background-light">

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button className="flex items-center justify-center px-6 h-12 rounded-lg bg-border-light  hover:bg-border-light/80 transition-colors">
            <span className="text-base font-bold text-text-light">
              Cancelar
            </span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Números apartados de Rifa Viaje a cancún
            </h1>
            <p className="text-lg text-gray-600">
              Seleccione los números que desea liberar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de números */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white border-2 border-red-400"></div>
                  <span className="text-base text-gray-600">Número apartado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-500"></div>
                  <span className="text-base text-gray-600">Número seleccionado</span>
                </div>
              </div>

              {/* Búsqueda */}
              <div className="mb-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar número:"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors h-12 pl-10 pr-4"
                  />
                </div>
              </div>

              {numerosFiltrados.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No se encontraron números apartados que coincidan con la búsqueda.
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {numerosFiltrados.map((numero) => {
                    const estaApartado = numerosApartados.some(n => n.numero === numero);
                    const estaSeleccionado = numerosSeleccionados.includes(numero);

                    return (
                      <NumeroButton
                        key={numero}
                        numero={numero}
                        estaApartado={estaApartado}
                        estaSeleccionado={estaSeleccionado}
                        onClick={handleSeleccionarNumero}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Panel de resumen */}
          <div className="lg:col-span-1">
            <ResumenLiberacion
              numerosSeleccionados={numerosSeleccionados}
              clientesAgrupados={clientesAgrupados}
            />
          </div>
        </div>
      </div>
    </div>
  );
}