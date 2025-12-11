import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SuccessModal from '../components/mensajeExito';
import ErrorModal from '../components/mensajeError';

const API_GATEWAY_URL = 'http://localhost:8080';

const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative flex justify-center items-center" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <span className="material-symbols-outlined text-4xl">close</span>
        </button>
        <img 
          src={imageUrl} 
          alt="Comprobante" 
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-white"
        />
      </div>
    </div>
  );
};

const ComprobanteCard = ({ comprobante, isSelected, onToggle, onVerComprobante, isDisabled }) => {
  
  const numerosLegibles = comprobante.numeros.map(n => n.numero).join(', ');

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-5 transition-colors ${
      isDisabled 
        ? 'bg-gray-50 border-gray-200 opacity-70'
        : isSelected ? 'border-primary ring-1 ring-primary' : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-4">
        {!isDisabled ? (
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
        ) : (
          <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center mt-1 text-green-500" title="Ya pagado">
             <span className="material-symbols-outlined">check_circle</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="mb-3 flex justify-between items-start">
            <div>
                <h3 className={`text-lg font-bold mb-1 ${isDisabled ? 'text-gray-500' : 'text-text-light'}`}>
                {comprobante.nombres_cliente} {comprobante.apellido_paterno_cliente}
                </h3>
                <p className="text-sm text-gray-600">{comprobante.correo_cliente}</p>
                <p className="text-sm text-gray-500 mt-1">Fecha de pago: {comprobante.fecha_pago}</p>
            </div>
            {isDisabled && (
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded border border-green-200">
                    PAGADO
                </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className={`rounded-lg p-3 ${isDisabled ? 'bg-gray-100' : 'bg-background-light'}`}>
              <p className="text-sm font-semibold text-text-light mb-1">Números:</p>
              <p className="text-base font-semibold text-text-light break-words">
                {numerosLegibles}
              </p>
            </div>
            <div className={`rounded-lg p-3 ${isDisabled ? 'bg-gray-100' : 'bg-background-light'}`}>
              <p className="text-sm font-semibold text-text-light mb-1">Total pagado:</p>
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
            className="w-full flex items-center justify-center gap-2 rounded-lg h-11 px-4 bg-border-light hover:bg-border-light/80 text-text-light text-sm font-bold transition-colors"
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

  const esComprobantePendiente = (comp) => {
    return comp.numeros.some(n => n.estado === 'PENDIENTE');
  };

  const handleToggle = (idPago) => {
    const comp = comprobantes.find(c => c.id_pago === idPago);
    if (!comp || !esComprobantePendiente(comp)) return;

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
      const pagosSeleccionados = comprobantes.filter(c => seleccionados.includes(c.id_pago));
      
      const numerosParaLiberar = pagosSeleccionados
        .flatMap(p => p.numeros)
        .map(n => n.numero);

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

  const comprobantesProcesados = useMemo(() => {
    let filtrados = comprobantes.filter(comp => {
      const searchLower = busqueda.toLowerCase();
      const nombreCompleto = `${comp.nombres_cliente} ${comp.apellido_paterno_cliente}`.toLowerCase();
      const numerosString = comp.numeros.map(n => n.numero).join(' ');
      
      return (
        nombreCompleto.includes(searchLower) ||
        comp.correo_cliente.toLowerCase().includes(searchLower) ||
        numerosString.includes(busqueda)
      );
    });

    return filtrados.sort((a, b) => {
        const aPendiente = esComprobantePendiente(a);
        const bPendiente = esComprobantePendiente(b);

        if (aPendiente && !bPendiente) return -1;
        if (!aPendiente && bPendiente) return 1;
        return 0;
    });
  }, [comprobantes, busqueda]);

  const obtenerNumerosSeleccionados = () => {
    return comprobantes
      .filter(c => seleccionados.includes(c.id_pago))
      .flatMap(c => c.numeros)
      .map(n => n.numero)
      .sort((a, b) => a - b);
  };

  const listaNumerosSeleccionados = obtenerNumerosSeleccionados();

  return (
    <div className="min-h-screen bg-background-light pb-32 font-display">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center px-6 h-12 rounded-lg bg-border-light hover:bg-border-light/80 transition-colors"
            >
              <span className="text-base font-bold text-text-light">
                Cancelar
              </span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[32px] font-bold tracking-tight text-text-light break-words">
                Gestión de Números Pagados
              </h1>
              <p className="text-lg text-gray-600">
                Verifica los comprobantes y marca los números como pagados
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
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 text-text-light placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors h-12 pl-10 pr-4"
                  />
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <p className="text-sm text-gray-600">
                  Mostrando {comprobantesProcesados.length} de {comprobantes.length} comprobantes
                </p>
              </div>

              {isLoading ? (
                 <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className='text-gray-500'>Cargando comprobantes...</p>
                 </div>
              ) : (
                <div className="space-y-4">
                  {comprobantesProcesados.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                      No se encontraron comprobantes que coincidan con la búsqueda.
                    </div>
                  ) : (
                    comprobantesProcesados.map((comprobante) => {
                        const isPendiente = esComprobantePendiente(comprobante);
                        return (
                            <ComprobanteCard
                                key={comprobante.id_pago}
                                comprobante={comprobante}
                                isSelected={seleccionados.includes(comprobante.id_pago)}
                                isDisabled={!isPendiente}
                                onToggle={handleToggle}
                                onVerComprobante={handleVerComprobante}
                            />
                        );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
              <h3 className="text-xl font-bold text-text-light mb-4">
                Resumen de números
              </h3>
              
              <div className="bg-background-light rounded-lg p-4 mb-6">
                <p className="text-base text-gray-600 mb-3">
                  Números a liberar:
                </p>
                <div className="max-h-60 overflow-y-auto mb-2 scrollbar-thin pr-2">
                    {listaNumerosSeleccionados.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {listaNumerosSeleccionados.map((num, idx) => (
                                <span 
                                  key={`${num}-${idx}`} 
                                  className="bg-white border border-gray-300 text-text-light text-sm font-bold px-2.5 py-1 rounded shadow-sm"
                                >
                                  {num}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-base text-gray-400 italic">Ningún número seleccionado</p>
                    )}
                </div>
                
                <div className="border-t border-border-light pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-600">Total números:</span>
                    <span className="text-2xl font-bold text-text-light">
                      {listaNumerosSeleccionados.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-500">Comprobantes:</span>
                    <span className="text-sm font-medium text-gray-600">
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
                {isProcessing ? 'Procesando...' : 'Marcar como pagado'}
                {!isProcessing && seleccionados.length > 0 && (
                  <span className="text-xs font-normal opacity-80">
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
        title="¡Números liberados de manera exitosa!"
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