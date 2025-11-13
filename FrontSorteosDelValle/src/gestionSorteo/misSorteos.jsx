import { SorteoCard } from "../components/sorteoCard";
import React, { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
//const mockSorteos = [
//{ id: 1, titulo: "Rifa de Xbox", imagen_url: "https://m.media-amazon.com/images/I/71AtLTRlT2L._AC_UF1000,1000_QL80_.jpg", estado: "Activo" },
//{ id: 2, titulo: "Viaje de ensueño...", imagen_url: "https://media.gq.com.mx/photos/620e915c43f71a078a35533f/master/pass/playa.jpg", estado: "Activo" },
//{ id: 3, titulo: "Cocina nueva...", imagen_url: "https://www.viacelere.com/wp-content/uploads/old-blog/2017/10/tipos-de-cocina_opt.jpg", estado: "Finalizado" },
//{ id: 4, titulo: "Rifa kit gamer", imagen_url: "https://www.cyberpuerta.mx/img/product/M/CP-NACEBTECHNOLOGY-NA-0934-7e92f0.jpg", estado: "Finalizado", }
//];


// Función para determinar el estado (¡IMPORTANTE!)
// Tu API no devuelve "estado", debemos calcularlo
const API_GATEWAY_URL = 'http://localhost:8080';

const getEstadoSorteo = (finPeriodoVenta) => {
  const ahora = new Date();
  const fechaFin = new Date(finPeriodoVenta);
  return ahora < fechaFin ? "Activo" : "Finalizado";
}

const MisSorteos = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [sorteos, setSorteos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSorteos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        //TODO: Cambiar el ID del organizador por el real
        const idOrganizador = 1;
        const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/organizador/${idOrganizador}`);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Error al obtener los sorteos');
        }

        let data = await response.json();

        data = data.map(sorteo => ({
          ...sorteo,
          estado: getEstadoSorteo(sorteo.finPeriodoVenta)
        }));
        setSorteos(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSorteos();
  }, []);


  //el array [] vacio hace que se ejecute solo una vez al montar el componente

  const handleEliminarSorteo = async (idSorteo) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este sorteo? Esta acción no se puede deshacer.")) {
      try {
        const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/${idSorteo}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Error al eliminar el sorteo');
        }

        //Actualizar la lista de sorteos en la UI
        setSorteos(sorteosActuales =>
          sorteosActuales.filter(sorteo => sorteo.id !== idSorteo)
        );

      } catch (error) {
        alert(error.message);
      }
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Cargando sorteos...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }


  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-body">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[32px] font-bold tracking-tight text-text-light">
          Mis Sorteos
        </h1>

      </div>

      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sorteos.map((sorteo) => (
          <SorteoCard
            key={sorteo.id}
            sorteo={sorteo}
          onNavigateInfo={()=> navigate(`/sorteos/${sorteo.id}`)}
          onEditarClick={() => navigate(`/sorteos/editar/${sorteo.id}`)}
          onVerBoletoClick={() => navigate(`/sorteos/${sorteo.id}/boletos`)}
          onEliminarClick={() => handleEliminarSorteo(sorteo.id)}
          />
        ))}
      </div>

      {/*TODO: Aquí es donde iría la paginación */}
    </div>
  );
};

export default MisSorteos;
