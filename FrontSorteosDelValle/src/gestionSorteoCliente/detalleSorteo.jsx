import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderCliente from '../components/headerCliente';
import { PremioCard } from '../components/premioCard';
import { InfoFechaCard } from '../components/infoFechaCard';
import volverIcon from '../assets/volver.png';
import boletoIcon from '../assets/boletoDark.png';

const mockSorteoData = {
  id: 5,
  titulo: "Rifa Smart TV. ¡Mira!",
  imagen_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=400&fit=crop",
  descripcion: "Participa para ganarte una increíble Smart TV 3994-pro max ultra hd 4k 144hz mega 2,3 trucos. Disfruta de la mejor experiencia visual con nuestra Smart TV de última generación. Con una pantalla de alta definición, acceso a aplicaciones de streaming y conectividad inteligente, esta TV transformará tu sala en un cine en casa.",
  precioNumero: 100.00,
  rangoNumeros: 200,
  finPeriodoVenta: "2024-09-30T00:00:00",
  fechaRealizacion: "2024-10-10T00:00:00",
  premios: [
    {
      id: 1,
      titulo: "Smart TV 3999-pro max",
      imagenPremioUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop"
    }
  ]
};

const DetalleSorteo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sorteoData] = useState(mockSorteoData);

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background-light">
      <HeaderCliente onNavigate={navigate} userName="Ricardo" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2"
            aria-label="Volver"
          >
            <img src={volverIcon} alt="Volver" className="w-11 h-11" />
          </button>
          <h1 className="text-[32px] font-bold tracking-tight text-text-light">
            {sorteoData.titulo}
          </h1>
          <span className="inline-flex items-center px-4 py-2 text-xl font-bold rounded-full bg-background-status text-card-number-2">
            Activo
          </span>
        </div>

        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img
            src={sorteoData.imagen_url}
            alt={sorteoData.titulo}
            className="w-full h-80 object-cover"
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <p className="text-lg text-text-light font-normal leading-relaxed mb-6">
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
              <p className="text-base font-medium text-white/80 mb-1">Precio por boleto</p>
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