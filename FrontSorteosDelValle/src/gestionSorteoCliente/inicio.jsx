import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderCliente from '../components/headerCliente';
import { SorteoCardCliente } from '../components/sorteoCardCliente';

const API_GATEWAY_URL = 'http://localhost:8080';

const Inicio = () => {
  const navigate = useNavigate();
  const [sorteos, setSorteos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSorteosActivos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/activos`);

        if (!response.ok) {
          throw new Error('Error en la petición');
        }

        const data = await response.json();

        const dataFormateada = data.map(sorteo => ({
          ...sorteo,
          precioNumero: parseFloat(sorteo.precio_numero)
        }));

        setSorteos(dataFormateada);
      } catch (error) {
        console.error("No se pudieron cargar los sorteos ", error);
        
        setSorteos([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchSorteosActivos();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sorteos disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <HeaderCliente onNavigate={navigate} userName="Ricardo" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-[32px] font-bold tracking-tight text-text-light mb-8">
          Inicio
        </h1>

        {sorteos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sorteos.map((sorteo) => (
              <SorteoCardCliente
                key={sorteo.id}
                sorteo={sorteo}
                onClick={() => navigate(`/sorteo/${sorteo.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto p-8">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                sentiment_dissatisfied
              </span>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No hay sorteos activos en este momento
              </h3>
              <p className="text-gray-600 text-sm">
                Vuelve más tarde para ver nuevas rifas disponibles.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inicio;