import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COMPROBANTES_MOCK = [
  {
    id: '001',
    nombre: 'Juan Salazar',
    email: 'juansalazar@gmail.com',
    numeros: [1, 2, 523, 1028],
    total: 1200.00,
    fechaPago: '10/11/2025'
  },
  {
    id: '002',
    nombre: 'María García',
    email: 'mariagarcia@gmail.com',
    numeros: [45, 67, 890],
    total: 900.00,
    fechaPago: '10/11/2025'
  },
  {
    id: '003',
    nombre: 'Juan Salazar',
    email: 'juansalazar@gmail.com',
    numeros: [1, 2, 523, 1028],
    total: 1200.00,
    fechaPago: '10/11/2025'
  },
  {
    id: '004',
    nombre: 'Pedro Martínez',
    email: 'pedromartinez@gmail.com',
    numeros: [100, 200, 300, 400],
    total: 1600.00,
    fechaPago: '10/11/2025'
  },
  {
    id: '005',
    nombre: 'Juan Salazar',
    email: 'juansalazar@gmail.com',
    numeros: [1, 2, 523, 1028],
    total: 1200.00,
    fechaPago: '10/11/2025'
  }
];

const ComprobanteCard = ({ comprobante, isSelected, onToggle, onVerComprobante }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(comprobante.id)}
          className={`flex-shrink-0 w-7 h-7 rounded-md border-2 transition-colors flex items-center justify-center mt-1 ${
            isSelected
              ? 'bg-primary border-primary'
              : 'bg-white border-gray-300 hover:border-primary'
          }`}
        >
          {isSelected && (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-text-light mb-1">
              Comprobante #{comprobante.id}
            </h3>
            <p className="text-base font-semibold text-text-light">{comprobante.nombre}</p>
            <p className="text-sm text-gray-600">{comprobante.email}</p>
            <p className="text-sm text-gray-500 mt-1">Fecha de pago: {comprobante.fechaPago}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-background-light rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Números pagados:</p>
              <p className="text-base font-semibold text-text-light">
                {comprobante.numeros.join(', ')}
              </p>
            </div>
            <div className="bg-background-light rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Total esperado:</p>
              <p className="text-base font-semibold text-text-light">
                ${comprobante.total.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onVerComprobante(comprobante.id);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg h-11 px-4 bg-primary hover:bg-primary/90 text-text-light text-base font-bold transition-colors shadow-sm"
          >
            Ver comprobante
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LiberarComprobantesPago() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState(['001', '003']);

  const handleToggle = (id) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(item => item !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  };

  const handleCancelar = () => {
    navigate(-1);
  };

  const handleMarcarPagado = () => {
    console.log('Marcar como pagado:', seleccionados);
    alert(`Marcando ${seleccionados.length} comprobante(s) como pagado(s)`);
  };

  const handleVerComprobante = (id) => {
    console.log('Ver comprobante:', id);
    alert(`Viendo comprobante #${id}`);
  };

  const comprobantesFiltrados = COMPROBANTES_MOCK.filter(comp => {
    const searchLower = busqueda.toLowerCase();
    return (
      comp.id.includes(busqueda) ||
      comp.nombre.toLowerCase().includes(searchLower) ||
      comp.email.toLowerCase().includes(searchLower) ||
      comp.numeros.some(num => num.toString().includes(busqueda))
    );
  });

  return (
    <div className="min-h-screen bg-background-light pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={handleCancelar}
              className="flex items-center justify-center px-6 h-12 rounded-lg bg-border-light hover:bg-border-light/80 transition-colors"
            >
              <span className="text-base font-bold text-text-light">
                Cancelar
              </span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[32px] font-bold tracking-tight text-text-light break-words">
                Comprobantes de pago de Rifa Smart TV. ¡Mira!
              </h1>
              <p className="text-lg text-gray-600">
                Seleccione los comprobantes que desea marcar como pagados
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="mb-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-button-add-light">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar números, clientes, comprobantes o correos:"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full rounded-lg bg-background-light border border-border-light text-text-light placeholder:text-text-light/40 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors h-12 pl-10 pr-4"
                  />
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <p className="text-sm text-gray-600">
                  Todos los comprobantes ({comprobantesFiltrados.length})
                </p>
              </div>

              <div className="space-y-4">
                {comprobantesFiltrados.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No se encontraron comprobantes que coincidan con la búsqueda.
                  </div>
                ) : (
                  comprobantesFiltrados.map((comprobante) => (
                    <ComprobanteCard
                      key={comprobante.id}
                      comprobante={comprobante}
                      isSelected={seleccionados.includes(comprobante.id)}
                      onToggle={handleToggle}
                      onVerComprobante={handleVerComprobante}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
              <h3 className="text-xl font-bold text-text-light mb-4">
                Resumen
              </h3>
              
              <div className="bg-background-light rounded-lg p-4 mb-6">
                <p className="text-base text-gray-600 mb-2">
                  Comprobantes seleccionados:
                </p>
                {seleccionados.length > 0 ? (
                  <p className="text-lg font-semibold text-text-light mb-4">
                    {seleccionados.join(', ')}
                  </p>
                ) : (
                  <p className="text-base text-gray-400 mb-4 italic">
                    Ningún comprobante seleccionado
                  </p>
                )}
                
                <div className="border-t border-border-light pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-600">Total:</span>
                    <span className="text-2xl font-bold text-text-light">
                      {seleccionados.length}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleMarcarPagado}
                disabled={seleccionados.length === 0}
                className="w-full flex flex-col items-center justify-center rounded-lg h-auto min-h-[48px] py-3 px-4 bg-primary hover:bg-primary/90 text-text-light text-base font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed gap-1"
              >
                Marcar como pagado
                {seleccionados.length > 0 && (
                  <span className="ml-2">
                    {seleccionados.length} comprobante{seleccionados.length !== 1 ? 's' : ''}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
      />
    </div>
  );
}