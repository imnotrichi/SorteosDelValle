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

  const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    const fetchTableroData = async () => {
      setIsloading(true);
      setError(null);
      try {
        if (!usuarioLogueado || !usuarioLogueado.correo) {
          throw new Error("No se identificó la sesión del usuario.");
        }

        const respId = await fetch(`${API_GATEWAY_URL}/api/sorteos/usuarios/id?correo=${encodeURIComponent(usuarioLogueado.correo)}`);
        
        if (!respId.ok) {
             throw new Error('No se pudo verificar tu cuenta de organizador para este sorteo (ID local no encontrado).');
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
          throw new Error(errData.message || 'Error al obtener los detalles del tablero');
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
  const isActivo = sorteoData.estado === 'Activo';

  return (
    <div className="min-h-screen bg-background-light font-display">

      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/misSorteos')}
                className="p-2 flex-shrink-0 rounded-full transition-colors hover:bg-black/5"
                aria-label="Volver"
              >
                <img src={volverIcon} alt="Volver" className="w-8 h-8" />
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-text-light">
                    {sorteoData.titulo}
                  </h1>
                  <span className={`px-3 py-1 text-sm font-bold rounded-full ${isActivo ? 'bg-green-300 text-green-900' : 'bg-gray-300 text-gray-800'
                    }`}>
                    {sorteoData.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/admin/editar/${idSorteo}`)}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm text-sm">
                <span className="material-symbols-outlined text-lg">edit</span>
                Editar
              </button>
              <button
                onClick={handleClickEliminar}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-red-600 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm text-sm">
                <span className="material-symbols-outlined text-lg">delete</span>
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

        <h2 className="text-xl font-bold text-text-light mb-4 px-1">Estadísticas del Sorteo</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-sm font-bold text-gray-400 mb-1">Boletos vendidos</p>
            <p className="text-3xl font-extrabold text-gray-900">
              {sorteoData.boletos_vendidos}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-sm font-bold text-gray-400 mb-1">Boletos apartados</p>
            <p className="text-3xl font-extrabold text-gray-900">
              {sorteoData.boletos_apartados}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-sm font-bold text-gray-400 mb-1">Boletos disponibles</p>
            <p className="text-3xl font-extrabold text-gray-900">
              {sorteoData.boletos_disponibles}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-sm font-bold text-gray-400 mb-1">Dinero recaudado</p>
            <p className="text-3xl font-extrabold text-gray-900">
              ${sorteoData.dinero_recaudado}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-sm font-bold text-gray-400 mb-1">Dinero por recaudar (apartados)</p>
            <p className="text-3xl font-extrabold text-gray-900">
              ${sorteoData.dinero_por_recaudar}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button className="flex items-center justify-between px-6 py-4 bg-green-400 hover:bg-green-500 text-black rounded-xl transition-all shadow-sm group cursor-pointer">
            <span className="text-lg font-bold">Ver comprobantes de pago</span>
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
              receipt_long
            </span>
          </button>

          <button
            onClick={() => navigate(`/admin/sorteo/numeros/${idSorteo}`)}
            className="flex items-center justify-between px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-sm group cursor-pointer"
          >
            <span className="text-lg font-bold">Ver números apartados</span>
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
              confirmation_number
            </span>
          </button>
        </div>

        <div className="mb-8">
          <DetallesSorteoCard
            descripcion={sorteoData.descripcion}
            rangoNumeros={sorteoData.boletos_vendidos + sorteoData.boletos_apartados + sorteoData.boletos_disponibles}
            PrecioPorNumero={sorteoData.precio_numero}
            fechaInicio={formatDate(sorteoData.fin_periodo_venta)}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Premios</h3>
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