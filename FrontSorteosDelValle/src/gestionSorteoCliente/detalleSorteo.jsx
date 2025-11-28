import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderCliente from '../components/headerCliente';
import { PremioCard } from '../components/premioCard';
import { InfoFechaCard } from '../components/infoFechaCard';
import volverIcon from '../assets/volver.png';
import boletoIcon from '../assets/boletoDark.png';
import SorteoNoDisponible from '../components/mensajeNoDisponible';

const API_GATEWAY_URL = 'http://localhost:8080';

const DetalleSorteo = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [sorteoData, setSorteoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetalleSorteo = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/${id}`);

        if (!response.ok) {
          throw new Error('Error al obtener el sorteo');
        }

        const data = await response.json();

        const sorteoFormateado = {
          ...data,
          precioNumero: parseFloat(data.precio_numero),
          finPeriodoVenta: data.fin_periodo_venta,
          fechaRealizacion: data.fecha_realizacion,
          premios: data.premiosData?.map(premio => ({
            id: premio.id,
            titulo: premio.titulo,
            imagenPremioUrl: premio.imagen_premio_url
          })) || []
        };

        setSorteoData(sorteoFormateado);
      } catch (error) {
        console.error("No se pudo cargar el sorteo:", error);
        setSorteoData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetalleSorteo();
    }
  }, [id]);

  const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
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

  const esActivo = new Date(sorteoData.finPeriodoVenta) > new Date();

  return (
    <div className="min-h-screen bg-background-light">
      <HeaderCliente onNavigate={navigate} userName="Ricardo" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6 w-full">
          <button
            onClick={() => navigate('/')}
            className="p-2 flex-shrink-0"
            aria-label="Volver"
          >
            <img src={volverIcon} alt="Volver" className="w-11 h-11" />
          </button>
          
          <div className="min-w-0">
             <h1 className="text-[32px] font-bold tracking-tight text-text-light break-words leading-tight">
                {sorteoData.titulo}
             </h1>
          </div>

          <div className="flex-shrink-0">
             {esActivo ? (
               <span className="inline-flex items-center px-4 py-2 text-xl font-bold rounded-full bg-background-status text-card-number-2 whitespace-nowrap">
                 Activo
               </span>
             ) : (
               <span className="inline-flex items-center px-4 py-2 text-xl font-bold rounded-full bg-gray-200 text-gray-600 whitespace-nowrap">
                 Finalizado
               </span>
             )}
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img
            src={sorteoData.imagen_url}
            alt={sorteoData.titulo}
            className="w-full h-80 object-cover"
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <p className="text-lg text-text-light font-normal leading-relaxed mb-6 break-words whitespace-pre-wrap">
            {sorteoData.descripcion}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoFechaCard
              label="Fecha límite de compra"
              fecha={formatFecha(sorteoData.finPeriodoVenta)}
            />
            <InfoFechaCard
              label="Fecha de rifa"
              fecha={formatFecha(sorteoData.fechaRealizacion)}
            />
          </div>
        </div>

        <div className="bg-card-number rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-white/80 mb-1">Precio por número</p>
              <p className="text-4xl font-bold text-white">
                ${sorteoData.precioNumero.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => navigate(`/sorteo/${id}/numeros`)}
              className="flex items-center justify-center rounded-lg h-14 px-8 bg-primary hover:bg-primary/90 text-text-light text-xl font-bold transition-colors shadow-lg gap-2"
            >
              <img src={boletoIcon} alt="Boleto" className="w-6 h-6" />
              Ver números disponibles
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold text-text-light mb-6">Premios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorteoData.premios?.map((premio) => (
              <PremioCard
                key={premio.id}
                id={premio.id}
                titulo={premio.titulo}
                imagen={premio.imagenPremioUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleSorteo;