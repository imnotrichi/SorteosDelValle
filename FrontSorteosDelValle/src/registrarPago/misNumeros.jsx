import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderCliente from '../components/headerCliente';
import {SorteoNumerosCard} from '../components/sorteoNumerosCard';

//const API_GATEWAY_URL = 'http://localhost:8080';

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
        const cargarDatosMock = () => {
            setIsLoading(true);

            const hoy = new Date();
            const ayer = new Date(hoy);
            ayer.setDate(hoy.getDate() - 1); 
            const manana = new Date(hoy);
            manana.setDate(hoy.getDate() + 5); 
            const datosMock = [
                {
                    id: 999,
                    titulo: "Gran Sorteo iPhone 15 Pro (MOCK)",
                    descripcion: "Este es un sorteo de prueba para validar el diseño.",
                    imagen_url: "https://res.cloudinary.com/drczej3mh/image/upload/v1765003531/g01veblbosur1dbcpuzm.jpg", 
                    rango_numeros: 100,
                    inicio_periodo_venta: ayer.toISOString(), 
                    fin_periodo_venta: manana.toISOString(),
                    fecha_realizacion: manana.toISOString(),
                    precio_numero: 50.00, 
                    numeros_vendidos: 5,
                    premiosData: [
                        {
                            id: 1,
                            titulo: "iPhone 15 Pro Max",
                            imagen_premio_url: "https://placehold.co/100x100/png"
                        }
                    ],
                    organizadoresData: [
                        { id: 1, correo: "abel@gmail.com" }
                    ],
                    configuracionData: {
                        id: 1,
                        tiempo_limite_apartado: 15,
                        tiempo_recordatorio_pago: 24
                    }
                },
                {
                    id: 1000,
                    titulo: "Rifa de Bono en Efectivo",
                    descripcion: "Gana $10,000 pesos en efectivo.",
                    imagen_url: "https://res.cloudinary.com/drczej3mh/image/upload/v1765003531/g01veblbosur1dbcpuzm.jpg",
                    rango_numeros: 500,
                    inicio_periodo_venta: ayer.toISOString(),
                    fin_periodo_venta: manana.toISOString(),
                    fecha_realizacion: manana.toISOString(),
                    precio_numero: 120.50,
                    numeros_vendidos: 100,
                    premiosData: [],
                    organizadoresData: [],
                    configuracionData: {}
                }
            ];

            const fechaActual = new Date();

            const sorteosVisibles = datosMock.filter(sorteo => {
                const fechaInicio = new Date(sorteo.inicio_periodo_venta);
                const fechaFin = new Date(sorteo.fin_periodo_venta);
                return fechaInicio <= fechaActual && fechaActual <= fechaFin;
            });

            const dataFormateada = sorteosVisibles.map(sorteo => ({
                ...sorteo,
                precioNumero: parseFloat(sorteo.precio_numero)
            }));

            setTimeout(() => {
                setSorteos(dataFormateada);
                setIsLoading(false);
            }, 500);
        };

        cargarDatosMock();
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
                <h1 className="text-[32px] font-bold tracking-tight text-text-light mb-8">
                    Mis números
                </h1>
                <p>Aquí puedes ver y gestionar los números que has apartado en nuestros sorteos. Completa tu pago para asegurar tu participación</p>

                {sorteos.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {sorteos.map((sorteo) => (
                            <SorteoNumerosCard
                                key={sorteo.id}
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