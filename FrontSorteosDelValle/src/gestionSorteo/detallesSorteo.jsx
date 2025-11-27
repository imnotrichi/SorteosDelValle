import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DetallesSorteoCard from "../components/detallesSorteoCard.jsx";
import { PremioCard } from "../components/premioCard.jsx";
import ConfirmationModal from "../components/mensajeConfirmacion";
import SuccessModal from "../components/mensajeExito";
import ErrorModal from "../components/mensajeError";
import SorteoNoDisponible from "../components/mensajeNoDisponible";

const API_GATEWAY_URL = 'http://localhost:8080';

const DetallesSorteo = () => {
  const navigate = useNavigate();
  const id = useParams();
  const idSorteo = id.idSorteo;
  const [sorteoData, setSorteo] = useState(null);
  const [isLoading, setIsloading] = useState(true);
  const [error, setError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSorteoData = async () => {
      setIsloading(true);
      setError(null);
      try {
        const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/${idSorteo}`);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Error al obtener los sorteos');
        }

        let data = await response.json();
        setSorteo(data);
      } catch (error) {
        console.error('Error al cargar el sorteo:', error);
        setError(error.message);
        setSorteo(null);
      } finally {
        setIsloading(false);
      }
    };
    if (idSorteo) {
      fetchSorteoData();
    }
  }, [idSorteo]);

  const handleClickEliminar = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmEliminar = async () => {
    setShowConfirmModal(false);
    
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/${idSorteo}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al eliminar el sorteo');
      }

      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error al eliminar:', error);
      setErrorMessage(error.message);
      setShowErrorModal(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/admin/misSorteos');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del sorteo...</p>
        </div>
      </div>
    );
  }

  if (error || !sorteoData) {
    return <SorteoNoDisponible />;
  }

  const formatDate = (fecha) => {
    if (!fecha) return '';
    return fecha.split('T')[0];
  };

  const boletosVendidos = sorteoData.numeros_vendidos || 0;
  const boletosRestantes = (sorteoData.rango_numeros || 0) - boletosVendidos;
  const pagoGenerado = boletosVendidos * (parseFloat(sorteoData.precio_numero) || 0);

  return (
    <div className="min-h-screen">
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

          <div className="flex items-center justify-between">
            <div className="border-amber-700">
              <h1 className="text-2xl font-bold text-text-light">
                Detalles de sorteo
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Administra los detalles, boletos y estado de tu sorteo
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/admin/editar/${idSorteo}`)}
                className="px-4 py-2 bg-green-400 hover:bg-green-500 text-gray-900 rounded-lg flex items-center gap-2 font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar
              </button>
              <button 
                onClick={() => navigate(`/admin/sorteo/boletos/${idSorteo}`)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-gray-900 rounded-lg flex items-center gap-2 font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver boletos
              </button>
              <button
                onClick={handleClickEliminar}
                className="px-4 py-2 bg-red-400 hover:bg-red-500 text-gray-900 rounded-lg flex items-center gap-2 font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img
            src={sorteoData.imagen_url}
            alt={sorteoData.titulo}
            className="w-full h-80 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h2 className="text-3xl font-bold text-white">
              {sorteoData.titulo}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Boletos vendidos</p>
            <p className="text-4xl font-bold text-gray-900">
              {boletosVendidos}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Boletos restantes</p>
            <p className="text-4xl font-bold text-gray-900">
              {boletosRestantes}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Pago generado</p>
            <p className="text-4xl font-bold text-gray-900">
              ${pagoGenerado.toFixed(2)}
            </p>
          </div>
        </div>

        <DetallesSorteoCard
          descripcion={sorteoData.descripcion}
          rangoNumeros={sorteoData.rango_numeros}
          PrecioPorNumero={sorteoData.precio_numero}
          fechaInicio={formatDate(sorteoData.inicio_periodo_venta)}
        />

        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Premios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorteoData.premiosData && sorteoData.premiosData.length > 0 ? (
              sorteoData.premiosData.map((premio) => (
                <PremioCard
                  key={premio.id}
                  titulo={premio.titulo}
                  imagen={premio.imagen_premio_url}
                />
              ))
            ) : (
              <p className="text-gray-500">No hay premios disponibles</p>
            )}
          </div>
        </div>

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
        onClose={handleSuccessClose}
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

export default DetallesSorteo;