import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NumeroButton } from '../components/numeroButtonApartado.jsx';
import { ResumenLiberacion } from '../components/resumenLiberacion.jsx';
import SuccessModal from '../components/mensajeExito.jsx';
import ErrorModal from '../components/mensajeError.jsx';

const API_GATEWAY_URL = 'http://localhost:8080';

export default function LiberarNumerosUI() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [numerosApartados, setNumerosApartados] = useState([]);
  const [numerosSeleccionados, setNumerosSeleccionados] = useState([]);
  const [nombreSorteo, setNombreSorteo] = useState('');
  
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      await Promise.all([fetchNumerosApartados(), fetchDetallesSorteo()]);
      setIsLoading(false);
    };
    cargarDatos();
  }, [id]);

  const fetchDetallesSorteo = async () => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNombreSorteo(data.titulo);
      }
    } catch (error) {
      console.error("Error al cargar detalles del sorteo:", error);
    }
  };

  const fetchNumerosApartados = async () => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/numeros/apartados?sorteo=${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener los números apartados');
      }

      const data = await response.json();
      setNumerosApartados(data);
    } catch (error) {
      console.error("Error:", error);
      setErrorModalMessage("No se pudieron cargar los números apartados. Inténtelo nuevamente.");
    }
  };

  const handleSeleccionarNumero = (numero) => {
    if (numerosSeleccionados.includes(numero)) {
      setNumerosSeleccionados(numerosSeleccionados.filter(n => n !== numero));
    } else {
      setNumerosSeleccionados([...numerosSeleccionados, numero]);
    }
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
        try {
             const errorData = await response.json();
             console.error("Error del backend:", errorData);
        } catch (e) {
             console.error("El backend devolvió HTML o texto plano en lugar de JSON");
        }
        throw new Error('Error al liberar números');
      }

      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error al liberar:', error);
      setErrorModalMessage("No se pudieron liberar los números seleccionados. Inténtelo nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setNumerosSeleccionados([]); 
    fetchNumerosApartados();
  };

  const todosLosNumeros = numerosApartados
    .map(n => n.numero)
    .sort((a, b) => a - b);

  const numerosFiltrados = todosLosNumeros.filter(numero => {
    return !busqueda || numero.toString().includes(busqueda);
  });

  const clientesAgrupados = numerosSeleccionados.map(numero => {
    const info = numerosApartados.find(n => n.numero === numero);
    return {
      numero,
      nombre: info?.nombre_cliente || 'Desconocido',
      email: info?.correo_cliente || 'Sin correo',
      fecha: info ? new Date(info.fecha_apartado).toLocaleDateString() : ''
    };
  }).sort((a, b) => a.numero - b.numero);

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

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-6 h-12 rounded-lg bg-border-light hover:bg-border-light/80 transition-colors"
          >
            <span className="text-base font-bold text-text-light">
              Volver
            </span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
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

              <div className="mb-6">
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
              </div>

              {numerosApartados.length === 0 ? (
                 <div className="p-8 text-center text-gray-500">
                    No hay números apartados en este sorteo aún.
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
            <div onClick={handleLiberarNumeros}>
                <ResumenLiberacion
                numerosSeleccionados={numerosSeleccionados}
                clientesAgrupados={clientesAgrupados}
                />
            </div>
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

      <ErrorModal
        isOpen={!!errorModalMessage}
        onClose={() => setErrorModalMessage(null)}
        title="Error al liberar números"
        message={errorModalMessage}
      />
    </div>
  );
}