import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DetallesSorteoCard from "../components/detallesSorteoCard.jsx";
import { PremioCard } from "../components/premioCard.jsx";
import ConfirmationModal from "../components/mensajeConfirmacion";
import SuccessModal from "../components/mensajeExito";
import ErrorModal from "../components/mensajeError";
import SorteoNoDisponible from "../components/mensajeNoDisponible";
import volverIcon from '../assets/volver.png';

const API_GATEWAY_URL = 'http://localhost:8080';

const getFriendlyErrorMessage = (error) => {
  const fullMessage = error.message || '';

  if (fullMessage.includes('Failed to fetch') || fullMessage.includes('NetworkError')) {
    return "No hay conexión con el servidor. Verifica tu internet.";
  }

  if (fullMessage.includes(':')) {
    const [statusCodeStr, ...msgParts] = fullMessage.split(':');
    const serverMessage = msgParts.join(':').trim();
    const statusCode = parseInt(statusCodeStr, 10);

    if (statusCode >= 400 && statusCode < 500) {
      if (serverMessage && serverMessage !== 'Object' && serverMessage.length > 0) {
        return serverMessage;
      }
    }
    if (statusCode >= 500) {
      return "Tuvimos un problema técnico interno. Por favor intenta más tarde.";
    }
  }

  if (fullMessage.includes('401') || fullMessage.includes('403')) return "No tienes permisos para realizar esta acción.";
  if (fullMessage.includes('404')) return "No encontramos la información solicitada.";

  return "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.";
};

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

  const getUsuarioSeguro = () => {
    try {
      const storedUser = localStorage.getItem('usuario');
      if (!storedUser) return null;
      return JSON.parse(storedUser);
    } catch (e) {
      console.error("Error storage:", e);
      return null;
    }
  };

  useEffect(() => {
    const fetchTableroData = async () => {
      setIsloading(true);
      setError(null);

      const usuarioLogueado = getUsuarioSeguro();

      try {
        if (!usuarioLogueado || !usuarioLogueado.correo) {
          throw new Error("No se identificó la sesión del usuario.");
        }

        const respId = await fetch(`${API_GATEWAY_URL}/api/sorteos/usuarios/id?correo=${encodeURIComponent(usuarioLogueado.correo)}`);

        if (!respId.ok) {
          throw new Error('No se pudo verificar tu cuenta de organizador (ID local no encontrado).');
        }

        const dataId = await respId.json();
        const idLocalUsuario = dataId.id;

        const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/tablero/${idSorteo}/usuario/${idLocalUsuario}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(`${response.status}: ${errData.message || 'Error al obtener los detalles del tablero'}`);
        }

        let data = await response.json();
        setSorteo(data);

      } catch (error) {
        console.error('Error al cargar el sorteo:', error);
        setError(getFriendlyErrorMessage(error)); 
        setSorteo(null);
      } finally {
        setIsloading(false);
      }
    };

    if (idSorteo) {
      fetchTableroData();
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
        let errorMessage = 'Error al eliminar el sorteo';
        try {
          const errData = await response.json();
          errorMessage = errData.message || errorMessage;
        } catch (e) { }

        throw new Error(`${response.status}: ${errorMessage}`);
      }

      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error al eliminar:', error);
      setErrorMessage(getFriendlyErrorMessage(error));
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

  const boletosPagados = sorteoData.numeros_pagados || 0;
  const boletosRestantes = (sorteoData.rango_numeros || 0) - boletosPagados;
  const pagoGenerado = boletosPagados * (parseFloat(sorteoData.precio_numero) || 0);
  const isActivo = sorteoData.estado === 'Activo';

  return (
    <div className="min-h-screen bg-background-light font-display">

      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/misSorteos')}
                className="p-2 flex-shrink-0 rounded-full transition-colors"
                aria-label="Volver"
              >
                <img src={volverIcon} alt="Volver" className="w-11 h-11" />
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[32px] font-bold text-text-light break-all">
                    {sorteoData.titulo}
                  </h1>
                  <span className={`px-4 py-2 text-xl font-bold rounded-full ${isActivo ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                    {sorteoData.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/admin/editar/${idSorteo}`)}
                className="px-6 py-2 bg-background-status hover:bg-green-400 text-text-light rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm text-base">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Editar
              </button>
              <button
                onClick={handleClickEliminar}
                className="px-6 py-2 bg-red-50 hover:bg-red-300 text-red-600 rounded-lg flex items-center gap-2 font-bold transition-colors border border-red-200 shadow-sm text-base">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16">

        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-md h-64 md:h-80 bg-gray-100">
          <img
            src={sorteoData.imagen_url}
            alt={sorteoData.titulo}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-2xl font-bold text-text-light mb-4 px-1">Tablero de control</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="font-medium text-gray-500 mb-1">Boletos pagados</p>
            <p className="text-3xl font-bold text-text-light">
              {sorteoData.boletos_pagados}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="font-medium text-gray-500 mb-1">Boletos apartados</p>
            <p className="text-3xl font-bold text-text-light">
              {sorteoData.boletos_apartados}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="font-medium text-gray-500 mb-1">Boletos disponibles</p>
            <p className="text-3xl font-bold text-text-light">
              {sorteoData.boletos_disponibles}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="font-medium text-gray-500 mb-1">Dinero recaudado</p>
            <p className="text-3xl font-bold text-text-light">
              ${sorteoData.dinero_recaudado}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="font-medium text-gray-500 mb-1">Dinero por recaudar (apartados)</p>
            <p className="text-3xl font-bold text-text-light">
              ${sorteoData.dinero_por_recaudar}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate(`/admin/comprobantesPago/${idSorteo}`)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-primary hover:bg-lime-500 text-text-light rounded-xl transition-all shadow-sm group cursor-pointer">
            <span className="material-symbols-outlined text-3xl transition-transform">
              receipt_long
            </span>
            <span className="text-lg font-bold">Ver comprobantes de pago</span>
          </button>

          <button
            onClick={() => navigate(`/admin/sorteo/numeros/${idSorteo}`)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-300 hover:bg-blue-400 text-text-light rounded-xl transition-all shadow-sm group cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-lg font-bold">Ver números apartados</span>
          </button>
        </div>

        <div className="mb-8">
          <DetallesSorteoCard
            descripcion={sorteoData.descripcion}
            rangoNumeros={sorteoData.boletos_pagados + sorteoData.boletos_apartados + sorteoData.boletos_disponibles}
            PrecioPorNumero={sorteoData.precio_numero}
            fechaInicio={formatDate(sorteoData.fin_periodo_venta)}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-bold text-text-light mb-4">Premios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorteoData.premios && sorteoData.premios.length > 0 ? (
              sorteoData.premios.map((premio, index) => (
                <PremioCard
                  key={index}
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
        title="¡Atención!"
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