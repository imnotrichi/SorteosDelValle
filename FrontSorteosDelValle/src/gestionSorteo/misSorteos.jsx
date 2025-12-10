import { SorteoCard } from "../components/sorteoCard";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/mensajeConfirmacion";
import SuccessModal from "../components/mensajeExito";
import ErrorModal from "../components/mensajeError";

const API_GATEWAY_URL = 'http://localhost:8080';

const getEstadoSorteo = (inicioPeriodoVenta, finPeriodoVenta) => {
  const ahora = new Date();
  const fechaInicio = new Date(inicioPeriodoVenta);
  const fechaFin = new Date(finPeriodoVenta);

  if (ahora < fechaInicio) {
    return "Próximamente";
  } else if (ahora > fechaFin) {
    return "Finalizado";
  } else {
    return "Activo";
  }
}
  
const parseDate = (dateString) => {
  if (!dateString) return new Date();

  if (dateString.includes('T') || dateString.includes('-')) {
    return new Date(dateString);
  }

  try {
    const [datePart, timePart] = dateString.split(',');
    const [day, month, year] = datePart.trim().split('/');
    
    return new Date(`${year}-${month}-${day}T23:59:59`); 
  } catch (e) {
    console.error("Error parseando fecha:", dateString);
    return new Date(dateString); 
  }
};

const getFriendlyErrorMessage = (error, context = 'general') => {
  const message = error.message || '';
  
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e inténtalo de nuevo.";
  }

  if (context === 'delete') {
    if (message.includes('405')) return "No puedes eliminar este sorteo porque ya tiene boletos vendidos o el sorteo ya pasó.";
    if (message.includes('404')) return "El sorteo que intentas eliminar ya no existe.";
  }

  if (context === 'fetch') {
    if (message.includes('401') || message.includes('403')) return "Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión nuevamente.";
    if (message.includes('404')) return "No pudimos encontrar la información de tus sorteos.";
  }

  return "Ocurrió un problema inesperado. Por favor, intenta realizar la acción nuevamente más tarde.";
};

const MisSorteos = ({ onNavigate }) => {
  const navigate = useNavigate();

  const [sorteos, setSorteos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [idSorteoAEliminar, setIdSorteoAEliminar] = useState(null);

  const getUsuarioSeguro = () => {
    try {
      const storedUser = localStorage.getItem('usuario');
      if (!storedUser) return null;
      return JSON.parse(storedUser);
    } catch (e) {
      console.error("");
      return null;
    }
  };

  useEffect(() => {
    const fetchSorteos = async () => {
      setIsLoading(true);
      setError(null);

      const usuarioLogueado = getUsuarioSeguro();

      try {
        if (!usuarioLogueado || !usuarioLogueado.correo) {
          throw new Error('No se encontró la sesión del usuario.');
        }

        const idOrganizador = usuarioLogueado.idusuario;

        const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/propios?correo=${usuarioLogueado.correo}`);

        if (!response.ok) {
          throw new Error(`Error al obtener datos`);
        }

        let data = await response.json();

        data = data.map(sorteo => ({
          ...sorteo,
          estado: getEstadoSorteo(sorteo.inicio_periodo_venta, sorteo.fin_periodo_venta)
        })).sort((a, b) => {
          const peso = { "Activo": 1, "Próximamente": 2, "Finalizado": 3 };
          return peso[a.estado] - peso[b.estado];
        });

        setSorteos(data);
      } catch (error) {
        console.error("");
        setError(getFriendlyErrorMessage(error, 'fetch'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSorteos();
  }, []);

  const handleEliminarClick = (idSorteo) => {
    setIdSorteoAEliminar(idSorteo);
    setShowConfirmModal(true);
  }

  const handleConfirmEliminar = async () => {
    setShowConfirmModal(false);
    if (!idSorteoAEliminar) return;

    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/${idSorteoAEliminar}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = 'Error al eliminar';
        try {
            const errData = await response.json();
            errorMessage = errData.message || errorMessage;
        } catch (e) {
            console.error("");
        }
        
        throw new Error(`${response.status}: ${errorMessage}`);
      }

      setSorteos(sorteosActuales =>
        sorteosActuales.filter(sorteo => sorteo.id !== idSorteoAEliminar)
      );

      setShowSuccessModal(true);

    } catch (error) {
      console.error("");
      setErrorMessage(getFriendlyErrorMessage(error, 'delete'));
      setShowErrorModal(true);
    } finally {
      setIdSorteoAEliminar(null);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sorteos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error al cargar sorteos
            </h3>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[32px] font-bold tracking-tight text-text-light mb-2">
            Mis Sorteos
          </h1>
          <p className="text-gray-600">
            Administra y gestiona todos tus sorteos activos y finalizados
          </p>
        </div>

        {sorteos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sorteos.map((sorteo) => (
              <SorteoCard
                key={sorteo.id}
                sorteo={sorteo}
                onNavigateInfo={() => navigate(`/admin/sorteos/${sorteo.id}`)}
                onEditarClick={() => navigate(`/admin/editar/${sorteo.id}`)}
                onVerBoletoClick={() => navigate(`/admin/sorteo/numeros/${sorteo.id}`)}
                onEliminarClick={() => handleEliminarClick(sorteo.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto p-8">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No tienes sorteos todavía
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Crea tu primer sorteo para comenzar a gestionar tus rifas
              </p>
              <button
                onClick={() => navigate('/crearSorteo')}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-text-light rounded-lg text-sm font-medium transition-colors"
              >
                Crear primer sorteo
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmEliminar}
        title="¿Eliminar sorteo?"
        message="¿Estás seguro de que deseas eliminar este sorteo? Esta acción no se puede deshacer."
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Sorteo eliminado exitosamente"
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error al eliminar"
        message={errorMessage}
      />
    </div>
  );
};

export default MisSorteos;