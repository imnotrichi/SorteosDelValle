import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderCliente from '../components/headerCliente';
import { NumeroButton } from '../components/numeroButton';
import { ResumenCompraCard } from '../components/resumenCompraCard';
import SuccessModal from '../components/mensajeExito';
import ErrorModal from '../components/mensajeError';
import SorteoNoDisponible from '../components/mensajeNoDisponible';

const API_GATEWAY_URL = 'http://localhost:8080';

const NumerosSorteo = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [sorteoData, setSorteoData] = useState(null);
  const [numerosDisponibles, setNumerosDisponibles] = useState([]);
  const [numerosSeleccionados, setNumerosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [esPeriodoVenta, setEsPeriodoVenta] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState(null);
  const [shouldReloadOnError, setShouldReloadOnError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const responseSorteo = await fetch(`${API_GATEWAY_URL}/api/sorteos/${id}`);
        if (!responseSorteo.ok) throw new Error('Error al obtener sorteo');
        const dataSorteo = await responseSorteo.json();

        const responseNumeros = await fetch(`${API_GATEWAY_URL}/api/numeros/disponibles?sorteo=${id}`);
        if (!responseNumeros.ok) throw new Error('Error al obtener números');
        const dataNumeros = await responseNumeros.json();

        const fechaActual = new Date();
        const fechaInicio = new Date(dataSorteo.inicio_periodo_venta);
        const fechaFin = new Date(dataSorteo.fin_periodo_venta);
        
        const estaEnVenta = fechaInicio <= fechaActual && fechaActual <= fechaFin;
        setEsPeriodoVenta(estaEnVenta);

        setSorteoData({
          id: dataSorteo.id,
          titulo: dataSorteo.titulo,
          rangoNumeros: dataSorteo.rango_numeros,
          precioNumero: parseFloat(dataSorteo.precio_numero),
          fechaInicio: fechaInicio,
          fechaFin: fechaFin
        });

        setNumerosDisponibles(dataNumeros);

      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleSeleccionarNumero = (numero) => {
    if (!esPeriodoVenta) return;

    if (numerosSeleccionados.includes(numero)) {
      setNumerosSeleccionados(numerosSeleccionados.filter(n => n !== numero));
    } else {
      setNumerosSeleccionados([...numerosSeleccionados, numero]);
    }
  };

  const handleCancelar = () => {
    navigate(-1);
  };

  const handleApartarNumeros = async () => {
    if (!esPeriodoVenta) {
      setErrorModalMessage('Este sorteo no se encuentra en periodo de venta.');
      return;
    }

    if (numerosSeleccionados.length === 0) {
      setShouldReloadOnError(false);
      setErrorModalMessage('Debes seleccionar al menos un número para continuar.');
      return;
    }

    setIsProcessing(true);
    try {
      const ID_CLIENTE_TEST = 3; 

      const response = await fetch(`${API_GATEWAY_URL}/api/numeros/apartar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numeros: numerosSeleccionados,
          id_sorteo: parseInt(id),
          id_cliente: ID_CLIENTE_TEST
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al apartar números');
      }

      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error al apartar:', error);
      setShouldReloadOnError(true);
      setErrorModalMessage(`No se pudieron apartar los números, inténtelo nuevamente.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  const handleCloseError = () => {
    setErrorModalMessage(null);
    if (shouldReloadOnError) {
      window.location.reload();
    }
  };

  const renderNumeros = () => {
    if (!sorteoData || !numerosDisponibles) return null;

    const numerosFiltrados = numerosDisponibles.filter(numero =>
      !busqueda || numero.toString().includes(busqueda)
    );

    if (numerosFiltrados.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          No se encontraron números disponibles que coincidan con la búsqueda.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {numerosFiltrados.map((numero) => {
          const estaSeleccionado = numerosSeleccionados.includes(numero);

          return (
            <NumeroButton
              key={numero}
              numero={numero}
              estaSeleccionado={estaSeleccionado}
              estaDisponible={esPeriodoVenta} 
              onClick={handleSeleccionarNumero}
            />
          );
        })}
      </div>
    );
  };

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

  if (!sorteoData) {
    return (
      <div className="min-h-screen bg-background-light">
         <HeaderCliente onNavigate={navigate} userName="Ricardo" />
         <SorteoNoDisponible />
      </div>
    );
  }

  const total = numerosSeleccionados.length * sorteoData.precioNumero;

  return (
    <div className="min-h-screen bg-background-light pb-32">
      <HeaderCliente onNavigate={navigate} userName="Ricardo" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!esPeriodoVenta && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r shadow-sm">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-yellow-500 mr-2">
                info
              </span>
              <div>
                <p className="font-bold text-yellow-700">Sorteo no disponible para venta.</p>
                <p className="text-sm text-yellow-600">
                  El periodo de venta para este sorteo 
                  {new Date() < sorteoData.fechaInicio ? ' aún no ha comenzado.' : ' ha finalizado.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancelar}
              className="flex items-center justify-center px-6 h-12 rounded-lg bg-border-light  hover:bg-border-light/80 transition-colors"
            >
              <span className="text-base font-bold text-text-light">
                Cancelar
              </span>
            </button>
            <div>
              <h1 className="text-[32px] font-bold tracking-tight text-text-light">
                Números de {sorteoData.titulo}
              </h1>
              <p className="text-lg text-gray-600">
                Seleccione los números que desea apartar.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded border-2 ${esPeriodoVenta ? 'bg-white border-gray-300' : 'bg-gray-100 border-gray-200'}`}></div>
                  <span className="text-base text-gray-600">Número libre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary"></div>
                  <span className="text-base text-gray-600">Número seleccionado</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-button-add-light">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar número:"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full rounded-lg bg-background-light border border-border-light text-text-light placeholder:text-text-light/40 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors h-12 pl-10 pr-4"
                  />
                </div>
              </div>

              {renderNumeros()}
            </div>
          </div>

          <div className="lg:col-span-1">
            <ResumenCompraCard
              precioNumero={sorteoData.precioNumero}
              numerosSeleccionados={numerosSeleccionados}
              total={total}
              onApartar={handleApartarNumeros}
            />
            {isProcessing && (
              <p className="text-center text-sm text-gray-500 mt-2">Apartando números...</p>
            )}
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccess}
        title={`¡Los números ${numerosSeleccionados.sort((a, b) => a - b).join(', ')} se apartaron con éxito!`}
      />

      <ErrorModal
        isOpen={!!errorModalMessage}
        onClose={handleCloseError}
        title="Error al apartar números"
        message={errorModalMessage}
      />

    </div>
  );
};

export default NumerosSorteo;