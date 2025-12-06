import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderCliente from '../components/headerCliente';
import FormSection from '../components/formulario';
import FileUpload from '../components/subirImagen';

const RegistrarComprobante = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const nombreUsuario = usuario?.nombres || 'Cliente';

    const [numeros, setNumeros] = useState([]);
    const [selectedNumeros, setSelectedNumeros] = useState([]);
    const [imagen, setImagen] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [precioUnitario, setPrecioUnitario] = useState(0);

    useEffect(() => {
        const mockData = [
            { id: 11, numero: 11, estado: 'apartado' },
            { id: 12, numero: 12, estado: 'apartado' },
            { id: 13, numero: 13, estado: 'pendiente' }, 
            { id: 14, numero: 14, estado: 'pagado' },    
        ];

        setNumeros(mockData);
        setPrecioUnitario(100); 
    }, [id]);

    const handleCheckboxChange = (numeroId) => {
        setSelectedNumeros(prev => {
            if (prev.includes(numeroId)) {
                return prev.filter(id => id !== numeroId);
            } else {
                return [...prev, numeroId];
            }
        });
    };

    const handleImageComprobanteChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, imagen: file });
        }
    };

    const totalPagar = selectedNumeros.length * precioUnitario;

    const getEstadoBadgeColor = (estado) => {
        switch (estado) {
            case 'apartado': return 'bg-[#CECECE] text-[#616161]';
            case 'pendiente': return 'bg-[#FFF3CD] text-[#F4BE15]';
            case 'pagado': return 'bg-[#BAF8AB] text-[#187F12]';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-[#eafbe4]">
            <HeaderCliente onNavigate={navigate} userName={nombreUsuario} />

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Título y Subtítulo */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Registrar comprobante de pago</h1>
                    <p className="text-gray-500 font-medium">Sube tu comprobante para confirmar el pago de tus números apartados</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* --- COLUMNA IZQUIERDA (Lista y Subida) --- */}
                    <div className="flex-1 flex flex-col gap-6">

                        {/* 1. Lista de Números */}
                        <FormSection title={`1. selecciona los números a pagar  $${precioUnitario}`}>
                            <div className="divide-y divide-gray-100">
                                {numeros.map((num) => {
                                    const isDisabled = num.estado === 'pagado'; 
                                    return (
                                        <div key={num.id} className={`flex items-center justify-between p-4 ${isDisabled ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    className="w-6 h-6 rounded-full border-2 border-gray-300 text-green-500 focus:ring-green-500 cursor-pointer"
                                                    checked={selectedNumeros.includes(num.id)}
                                                    onChange={() => handleCheckboxChange(num.id)}
                                                    disabled={isDisabled}
                                                />
                                                <span className="text-gray-800 font-medium text-lg">
                                                    Número #{num.numero}-Sorteo playa 2025
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${getEstadoBadgeColor(num.estado)}`}>
                                                {num.estado}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </FormSection>

                        {/* 2. Subir Imagen */}
                        <FormSection title={"2. Imagen"}>
                            <FileUpload
                                id="sorteo-imagen"
                                onChange={handleImageComprobanteChange}
                            //TODO: fileValue={formData.imagen}
                            />
                        </FormSection>
                    </div>

                    {/* --- COLUMNA DERECHA (Resumen Sticky) --- */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen de pago</h2>

                            <div className="flex justify-between mb-2 text-sm text-gray-500">
                                <span>Boletos seleccionados</span>
                                <span>{selectedNumeros.length}</span>
                            </div>

                            <div className="flex justify-between mb-6 text-sm text-gray-500 border-b border-gray-100 pb-4">
                                <span>Subtotal</span>
                                <span>${totalPagar.toFixed(2)} MXN</span>
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="font-medium text-gray-700">Total a pagar:</span>
                                <span className="text-3xl font-bold text-green-600">${totalPagar.toFixed(2)}</span>
                            </div>

                            <button
                                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-colors ${selectedNumeros.length > 0 && imagen
                                    ? 'bg-[#4ade80] hover:bg-[#42c974] text-gray-900'
                                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                                    }`}
                                disabled={selectedNumeros.length === 0 || !imagen}
                            >
                                Enviar comprobante
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RegistrarComprobante;