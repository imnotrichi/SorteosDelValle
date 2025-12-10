import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SuccessModal from '../components/mensajeExito';
import ErrorModal from '../components/mensajeError';

const API_GATEWAY_URL = 'http://localhost:8080';

const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          <span className="material-symbols-outlined text-4xl">close</span>
        </button>
        <img 
          src={imageUrl} 
          alt="Comprobante" 
          className="w-full h-full object-contain rounded-lg bg-white"
        />
      </div>
    </div>
  );
};

const ComprobanteCard = ({ comprobante, isSelected, onToggle, onVerComprobante }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-5 transition-colors ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}>
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(comprobante.id_pago)}
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
              {comprobante.nombres_cliente} {comprobante.apellido_paterno_cliente}
            </h3>
            <p className="text-sm text-gray-600">{comprobante.correo_cliente}</p>
            <p className="text-sm text-gray-500 mt-1">Fecha de pago: {comprobante.fecha_pago}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-background-light rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Números:</p>
              <p className="text-base font-semibold text-text-light break-words">
                {comprobante.numeros.join(', ')}
              </p>
            </div>
            <div className="bg-background-light rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Total pagado:</p>
              <p className="text-base font-semibold text-text-light">
                ${parseFloat(comprobante.total_esperado).toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onVerComprobante(comprobante.url_comprobante);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg h-11 px-4 bg-gray-100 hover:bg-gray-200 text-text-light text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-lg">visibility</span>
            Ver comprobante
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LiberarComprobantesPago() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [comprobantes, setComprobantes] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  useEffect(() => {
    fetchPagos();
  }, [id]);

  const fetchPagos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/pagos/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener los comprobantes');
      }
      const data = await response.json();

      setComprobantes(data);
    } catch (error) {
      console.error(error);
      setErrorMsg("No se pudieron cargar los comprobantes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (idPago) => {
    if (seleccionados.includes(idPago)) {
      setSeleccionados(seleccionados.filter(item => item !== idPago));
    } else {
      setSeleccionados([...seleccionados, idPago]);
    }
  };

  const handleVerComprobante = (url) => {
    setSelectedImageUrl(url);
    setShowImageModal(true);
  };

  const handleMarcarPagado = async () => {
    if (seleccionados.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Necesitamos obtener TODOS los números de los pagos seleccionados
      // Filtramos los comprobantes seleccionados
      const pagosSeleccionados = comprobantes.filter(c => seleccionados.includes(c.id_pago));
      
      // Extraemos todos los números en un solo array plano
      const numerosParaLiberar = pagosSeleccionados.flatMap(p => p.numeros);

      // 2. Enviar petición al backend
      const response = await fetch(`${API_GATEWAY_URL}/api/numeros/marcar-pagados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_sorteo: parseInt(id),
          numeros: numerosParaLiberar
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al procesar el pago');
      }

      setShowSuccess(true);
      
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Ocurrió un error al marcar como pagado.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setSeleccionados([]);
    fetchPagos();
  };

  const comprobantesFiltrados = comprobantes.filter(comp => {
    const searchLower = busqueda.toLowerCase();
    const nombreCompleto = `${comp.nombres_cliente} ${comp.apellido_paterno_cliente}`.toLowerCase();
    
    return (
      nombreCompleto.includes(searchLower) ||
      comp.correo_cliente.toLowerCase().includes(searchLower) ||
      comp.numeros.some(num => num.toString().includes(busqueda))
    );
  });

  return (
    <div className="min-h-screen bg-background-light pb-32 font-display">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center px-6 h-12 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <span className="text-base font-bold text-text-light">
                Volver
              </span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[32px] font-bold tracking-tight text-text-light break-words">
                Gestión de Comprobantes
              </h1>
              <p className="text-lg text-gray-600">
                Verifica los comprobantes y marca los números como pagados.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              
              <div className="mb-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, correo o número..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full rounded-lg bg-background-light border border-border-light text-text-light placeholder:text-text-light/40 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors h-12 pl-10 pr-4"
                  />
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <p className="text-sm text-gray-600">
                  Mostrando {comprobantesFiltrados.length} de {comprobantes.length} comprobantes
                </p>
              </div>

              {isLoading ? (
                 <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className='text-gray-500'>Cargando comprobantes...</p>
                 </div>
              ) : (
                <div className="space-y-4">
                  {comprobantesFiltrados.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                      No se encontraron comprobantes que coincidan con la búsqueda.
                    </div>
                  ) : (
                    comprobantesFiltrados.map((comprobante) => (
                      <ComprobanteCard
                        key={comprobante.id_pago}
                        comprobante={comprobante}
                        isSelected={seleccionados.includes(comprobante.id_pago)}
                        onToggle={handleToggle}
                        onVerComprobante={handleVerComprobante}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
              <h3 className="text-xl font-bold text-text-light mb-4">
                Resumen de acción
              </h3>
              
              <div className="bg-background-light rounded-lg p-4 mb-6">
                <p className="text-base text-gray-600 mb-2">
                  Seleccionados:
                </p>
                <div className="max-h-32 overflow-y-auto mb-2 scrollbar-thin">
                    {seleccionados.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-text-light">
                            {seleccionados.map(id => {
                                const c = comprobantes.find(x => x.id_pago === id);
                                return <li key={id} className="truncate">{c ? c.nombres_cliente : 'Desconocido'}</li>
                            })}
                        </ul>
                    ) : (
                        <p className="text-base text-gray-400 italic">Ninguno</p>
                    )}
                </div>
                
                <div className="border-t border-border-light pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-600">Total Pagos:</span>
                    <span className="text-2xl font-bold text-text-light">
                      {seleccionados.length}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleMarcarPagado}
                disabled={seleccionados.length === 0 || isProcessing}
                className="w-full flex flex-col items-center justify-center rounded-lg h-auto min-h-[48px] py-3 px-4 bg-primary hover:bg-primary/90 text-text-light text-base font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed gap-1"
              >
                {isProcessing ? 'Procesando...' : 'Marcar como Pagado'}
                {!isProcessing && seleccionados.length > 0 && (
                  <span className="text-xs font-normal opacity-80">
                    (Liberará números asociados)
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ImageModal 
        isOpen={showImageModal} 
        onClose={() => setShowImageModal(false)} 
        imageUrl={selectedImageUrl} 
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="¡Números marcados como pagados correctamente!"
      />

      <ErrorModal
        isOpen={!!errorMsg}
        onClose={() => setErrorMsg(null)}
        title="Error"
        message={errorMsg}
      />
    </div>
  );
}