import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NumeroButton } from '../components/numeroButtonApartado.jsx';
import { ResumenLiberacion } from '../components/resumenLiberacion.jsx';
import SuccessModal from '../components/mensajeExito.jsx';
import SorteoNoDisponible from '../components/mensajeNoDisponible.jsx';

const API_GATEWAY_URL = 'http://localhost:8080';

const ErrorModalCustom = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="relative w-full max-w-md p-4 mx-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl p-8 text-center flex flex-col items-center gap-6 border border-border-light dark:border-border-dark">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-red-500">
              error
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-light dark:text-text-dark">
            Error al liberar números
          </h3>
          <p className="text-sm text-text-light/80 dark:text-text-dark/80">
            {message || 'Ha ocurrido un error inesperado.'}
          </p>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary/90 text-text-dark text-base font-bold transition-colors shadow-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LiberarNumerosUI() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [numerosApartados, setNumerosApartados] = useState([]);
  const [numerosSeleccionados, setNumerosSeleccionados] = useState([]);

  const [nombreSorteo, setNombreSorteo] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState(null);
  const [isVentaFinalizada, setIsVentaFinalizada] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchNumerosApartados(), fetchDetallesSorteo()]);
      } catch (error) {
        console.error("Error crítico en la carga de datos:", error);
        setNombreSorteo(null);
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, [id]);

  const fetchDetallesSorteo = async () => {
    const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/${id}`);
    if (!response.ok) {
      throw new Error('No se pudo obtener la información del sorteo');
    }
    const data = await response.json();
    setNombreSorteo(data.titulo);

    const fechaFin = new Date(data.fin_periodo_venta);
    setIsVentaFinalizada(new Date() > fechaFin);
  };

  const fetchNumerosApartados = async () => {
    const response = await fetch(`${API_GATEWAY_URL}/api/numeros/apartados?sorteo=${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener los números apartados');
    }
    const data = await response.json();
    setNumerosApartados(data);
  };

  const handleSeleccionarNumero = (numero) => {
    if (numerosSeleccionados.includes(numero)) {
      setNumerosSeleccionados(numerosSeleccionados.filter(n => n !== numero));
    } else {
      setNumerosSeleccionados([...numerosSeleccionados, numero]);
    }
  };

  const todosLosNumeros = numerosApartados
    .map(n => n.numero)
    .sort((a, b) => a - b);

  const numerosFiltrados = todosLosNumeros.filter(numero => {
    return !busqueda || numero.toString().includes(busqueda);
  });

  const handleSeleccionarTodos = () => {
    const nuevos = [...new Set([...numerosSeleccionados, ...numerosFiltrados])];
    setNumerosSeleccionados(nuevos);
  };

  const handleDeseleccionarTodos = () => {
    setNumerosSeleccionados([]);
  };

  const handleLiberarNumeros = async () => {
    if (numerosSeleccionados.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/numeros/liberar`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numeros: numerosSeleccionados,
          id_sorteo: parseInt(id)
        }),
      });

      if (!response.ok) {
        let mensajeError = 'Error en la petición';

        try {
          const errorData = await response.json();
          console.error("Error backend:", errorData);
          
          if (errorData.message) {
            mensajeError = errorData.message;
          }
        } catch (e) {
          console.error("La respuesta no es un JSON válido");
        }
        
        throw new Error(mensajeError);
      }

      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error al liberar:', error);
      setErrorModalMessage("Inténtelo nuevamente");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setNumerosSeleccionados([]);

    fetchNumerosApartados().catch(e => console.error("Error recargando lista:", e));
  };

  const clientesAgrupados = numerosSeleccionados.map(numero => {
    const info = numerosApartados.find(n => n.numero === numero);
    return {
      numero,
      nombre: info?.nombre_cliente || 'Desconocido',
      email: info?.correo_cliente || 'Sin correo',
      fecha: info ? new Date(info.fecha_apartado).toLocaleDateString() : '',
      fechaRaw: info ? new Date(info.fecha_apartado) : new Date(0)
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando números...</p>
        </div>
      </div>
    );
  }

  if (!nombreSorteo) {
    return (
      <div className="min-h-screen bg-background-light">
        <SorteoNoDisponible />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-6 h-12 rounded-lg bg-border-light hover:bg-border-light/80 transition-colors"
          >
            <span className="text-base font-bold text-text-light">
              Cancelar
            </span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-800 break-words">
              Números apartados de {nombreSorteo}
            </h1>
            <p className="text-lg text-gray-600">
              Seleccione los números que desea liberar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white border-2 border-red-400"></div>
                  <span className="text-base text-gray-600">Número apartado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-500"></div>
                  <span className="text-base text-gray-600">Seleccionado para liberar</span>
                </div>
              </div>

              <div className="mb-6 space-y-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar número apartado:"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors h-12 pl-10 pr-4"
                  />
                </div>

                <div className="flex justify-end gap-4 text-sm">
                  <button
                    onClick={handleSeleccionarTodos}
                    disabled={numerosFiltrados.length === 0}
                    className="text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Seleccionar visibles
                  </button>
                  <button
                    onClick={handleDeseleccionarTodos}
                    disabled={numerosSeleccionados.length === 0}
                    className="text-red-500 hover:text-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deseleccionar todo
                  </button>
                </div>
              </div>

              {numerosApartados.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No hay números apartados en este sorteo.
                </div>
              ) : numerosFiltrados.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No se encontraron números que coincidan con la búsqueda.
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {numerosFiltrados.map((numero) => {
                    const estaSeleccionado = numerosSeleccionados.includes(numero);
                    const estaApartado = true;

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

          <div className="lg:col-span-1">
            <ResumenLiberacion
              numerosSeleccionados={numerosSeleccionados}
              clientesAgrupados={clientesAgrupados}
              onLiberar={handleLiberarNumeros}
              isVentaFinalizada={isVentaFinalizada}
            />

            {isProcessing && (
              <p className="text-center text-sm text-gray-500 mt-2 animate-pulse">Liberando números...</p>
            )}
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccess}
        title={`¡Se han liberado ${numerosSeleccionados.length} número(s) exitosamente!`}
      />

      <ErrorModalCustom
        isOpen={!!errorModalMessage}
        onClose={() => setErrorModalMessage(null)}
        message={errorModalMessage}
      />
    </div>
  );
}