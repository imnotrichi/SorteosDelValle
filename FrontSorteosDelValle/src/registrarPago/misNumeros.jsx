import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderCliente from '../components/headerCliente';
import { SorteoNumerosCard } from '../components/sorteoNumerosCard';

const API_GATEWAY_URL = 'http://localhost:8080';

const parseDate = (dateString) => {
    if (!dateString) return new Date();

    if (dateString.includes('T') || dateString.includes('-') && !dateString.includes('/')) {
        return new Date(dateString);
    }

    try {
        const [datePart] = dateString.split(',');
        const [day, month, year] = datePart.trim().split('/');
        return new Date(`${year}-${month}-${day}T00:00:00`);
    } catch (e) {
        return new Date();
    }
};

const MisNumeros = () => {
    const navigate = useNavigate();
    const [sorteos, setSorteos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const nombreUsuario = usuario.nombres;

    /**  useEffect(() => {
         const fetchSorteosActivos = async () => {
             setIsLoading(true);
             try {
                 const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/activos`);
 
                 if (!response.ok) {
                     throw new Error('Error en la petición');
                 }
 
                 const data = await response.json();
                 const fechaActual = new Date();
 
                 const sorteosVisibles = data.filter(sorteo => {
                     const fechaInicio = new Date(sorteo.inicio_periodo_venta);
                     const fechaFin = new Date(sorteo.fin_periodo_venta);
 
                     return fechaInicio <= fechaActual && fechaActual <= fechaFin;
                 });
 
                 const dataFormateada = sorteosVisibles.map(sorteo => ({
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
     }, []); **/

    useEffect(() => {
        const fetchSorteosActivos = async () => {
            setIsLoading(true);
            try {
                if (!usuario.correo) throw new Error("Usuario no autenticado");

                const response = await fetch(`${API_GATEWAY_URL}/api/numeros/cliente?correo=${usuario.correo}`); //TODO: cambiarlo por correo

                if (!response.ok) {
                    throw new Error('Error en la petición');
                }

                const data = await response.json();
                const fechaActual = new Date();

                const sorteosVisibles = data.filter(sorteo => {
                    const fechaInicio = parseDate(sorteo.inicio_periodo_venta);
                    const fechaFin = parseDate(sorteo.fin_periodo_venta);

                    fechaFin.setHours(23, 59, 59, 999);

                    return fechaInicio <= fechaActual && fechaActual <= fechaFin;
                });

                const dataFormateada = sorteosVisibles.map(sorteo => ({
                    ...sorteo,
                    id: sorteo.id_sorteo || sorteo.id,
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
                    <p className="text-gray-600">Cargando sorteos...</p>
                </div>
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-background-light">
            <HeaderCliente onNavigate={navigate} userName={nombreUsuario} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="mb-3 text-3xl font-bold text-text-light">Mis números</h1>
                <p className="mb-5 text-gray-600">Aquí puedes ver y gestionar los números que has apartado en nuestros sorteos, completa tu pago para asegurar tu participación</p>


                {sorteos.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {sorteos.map((sorteo) => (
                            <SorteoNumerosCard
                                key={sorteo.id_sorteo}
                                sorteo={sorteo}
                                onClick={() => navigate(`/registrar-comprobante/${sorteo.id}`)}
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
                                No hay sorteos disponibles en este momento
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

export default MisNumeros;