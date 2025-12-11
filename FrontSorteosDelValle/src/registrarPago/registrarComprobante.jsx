import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderCliente from '../components/headerCliente';
import FormSection from '../components/formulario';
import FileUpload from '../components/subirImagen';
import SuccessModal from '../components/mensajeExito';
import ErrorModal from '../components/mensajeError';

const CLOUDINARY_CLOUD_NAME = "drczej3mh";
const CLOUDINARY_UPLOAD_PRESET = "imagenes_sorteosdelvalle";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const API_GATEWAY_URL = 'http://localhost:8080';

const handleImageUpload = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Error al subir la imagen a Cloudinary');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Error en handleImageUpload:', error);
        throw error;
    }
};

const RegistrarComprobante = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const nombreUsuario = usuario?.nombres || 'Cliente';

    const [sorteoInfo, setSorteoInfo] = useState(null);
    const [listaNumeros, setListaNumeros] = useState([]);
    const [numerosSeleccionados, setNumerosSeleccionados] = useState([]);

    const [imagenFile, setImagenFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [isUploading, setIsUploading] = useState(false);
    const [precioUnitario, setPrecioUnitario] = useState(100);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState(null);

    useEffect(() => {

        const fetchNumeroData = async () => {
            setIsLoadingData(true);
            try {
                if (!usuario.correo) {
                    throw new Error("No hay sesión de usuario activa.");
                }

                const responseNumeros = await fetch(`${API_GATEWAY_URL}/api/numeros/cliente-sorteo?correo=${usuario.correo}&id=${id}`);
                if (!responseNumeros.ok) throw new Error('Error al obtener los números del cliente');

                const dataNumeros = await responseNumeros.json();

                let precio = parseFloat(dataNumeros.precio_numero);

                setSorteoInfo({
                    id_sorteo: dataNumeros.id_sorteo,
                    titulo: dataNumeros.titulo,
                    fecha_realizacion: dataNumeros.fecha_realizacion
                });

                setListaNumeros(dataNumeros.numeros || []);
                setPrecioUnitario(precio);

            } catch (error) {
                console.error(error);
                setErrorModalMessage("Error al cargar la información del sorteo.");
            } finally {
                setIsLoadingData(false);
            }
        };

        if (id) fetchNumeroData();
    }, [id, usuario.correo]);

    const handleCheckboxChange = (numeroValor) => {
        setNumerosSeleccionados(prev => {
            if (prev.includes(numeroValor)) {
                return prev.filter(n => n !== numeroValor);
            } else {
                return [...prev, numeroValor];
            }
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagenFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };



    const handleSubmit = async (e) => {
        if (numerosSeleccionados.length === 0 || !imagenFile) return;
        setIsUploading(true);

        try {
            const cloudinaryUrl = await handleImageUpload(imagenFile);

            const payload = {
                id_sorteo: sorteoInfo.id_sorteo,
                numeros: numerosSeleccionados,
                url_comprobante: cloudinaryUrl
            }

            console.log("Envienado al backend: ", payload);

            const response = await fetch(`${API_GATEWAY_URL}/api/pagos/registrar-comprobante`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al registrar el comprobante');
            }

            setShowSuccessModal(true);

        } catch (error) {
            console.error(error)
            setErrorModalMessage("Ocurrió un error al enviar tu comprobante. Intenta nuevamente");
        }
        finally {
            setIsUploading(false);
        };
    };

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        window.location.reload();
    }

    const totalPagar = numerosSeleccionados.length * precioUnitario;

    const getEstadoBadgeColor = (estado) => {
        const estadoLower = estado ? estado.toLowerCase() : '';
        switch (estado) {
            case 'APARTADO': return 'bg-[#CECECE] text-[#616161]';
            case 'PENDIENTE': return 'bg-[#FFF3CD] text-[#F4BE15]';
            case 'PAGADO': return 'bg-[#BAF8AB] text-[#187F12]';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando tus números...</p>
                </div>
            </div>
        );
    }
    if (!sorteoInfo) return <div className="p-10 text-center">No se encontró información del sorteo.</div>;

    return (
        <div className="min-h-screen bg-[#eafbe4]">
            <HeaderCliente onNavigate={navigate} userName={nombreUsuario} />

            <div className="max-w-6xl mx-auto px-4 py-8">

                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center px-6 h-12 rounded-lg bg-border-light hover:bg-border-light/80 transition-colors shadow-sm"
                    >
                        <span className="text-base font-bold text-text-light">
                            Cancelar
                        </span>
                    </button>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold text-text-light">Registrar Comprobante</h1>
                        <p className="text-gray-600">Sube tu comprobante para confirmar el pago de tus números apartados</p>
                        <p className="text-gray-600 mt-1">
                            Sorteo: <span className="font-medium text-gray-800">{sorteoInfo.titulo}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    <div className="flex-1 flex flex-col gap-6">

                        <FormSection title={`1. Selecciona los números a pagar`}>
                            <div className="divide-y divide-gray-100">
                                {listaNumeros.length > 0 ? (
                                    listaNumeros.map((item, index) => {
                                        const estadoLower = item.estado.toLowerCase();
                                        const isDisabled = estadoLower !== 'apartado' && estadoLower !== 'apartados';
                                        const isSelected = numerosSeleccionados.includes(item.numero);

                                        return (
                                            <div key={index} className={`flex items-center justify-between p-4 ${isDisabled ? 'opacity-50 bg-gray-50' : 'hover:bg-background-light cursor-pointer'}`} onClick={() => !isDisabled && handleCheckboxChange(item.numero)}>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 rounded focus:ring-primary cursor-pointer text-primary accent-primary border-gray-300"
                                                        checked={isSelected}
                                                        onChange={() => handleCheckboxChange(item.numero)}
                                                        disabled={isDisabled}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div>
                                                        <p className="font-bold text-text-light text-lg">Número {item.numero}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{item.estado}</p>
                                                    </div>
                                                </div>

                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getEstadoBadgeColor(item.estado)}`}>
                                                    {item.estado}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="p-4 text-gray-500 text-center">No tienes números asociados a este sorteo.</p>
                                )}
                            </div>
                        </FormSection>

                        <FormSection title={"2. Imagen de pago"}>
                            <FileUpload
                                id="comprobante-upload"
                                label="Seleccionar imagen"
                                onChange={handleImageChange}
                                fileValue={imagenFile}
                            />

                            {previewUrl && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-600 mb-2">Vista previa:</p>
                                    <div className="relative w-full max-w-xs h-64 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                        <img
                                            src={previewUrl}
                                            alt="Vista previa"
                                            className='w-full h-full object-contain'
                                        />
                                    </div>
                                </div>
                            )}
                        </FormSection>
                    </div>

                    <div className="w-full lg:w-96">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-text-light mb-6">Resumen de pago</h2>

                            <div className="flex justify-between mb-2 text-sm text-gray-500">
                                <span>Números seleccionados</span>
                                <span>{numerosSeleccionados.length}</span>
                            </div>

                            <div className="flex justify-between mb-6 text-sm text-gray-500 border-b border-gray-100 pb-4">
                                <span>Precio unitario</span>
                                <span className="font-medium">${precioUnitario}</span>
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="font-medium text-gray-900">Total a pagar:</span>
                                <span className="text-3xl font-bold text-text-light">${totalPagar.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className={`w-full py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${numerosSeleccionados.length > 0 && imagenFile
                                    ? 'text-text-light bg-primary hover:bg-[#42c974]'
                                    : 'text-gray-500 bg-gray-300 cursor-not-allowed'
                                    }`}
                                disabled={numerosSeleccionados.length === 0 || !imagenFile || isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Enviar comprobante</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                Tus números pasarán a estado "Pendiente" hasta que el administrador verifique el pago.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleCloseSuccess}
                title="¡Comprobante enviado!"
                message="Hemos recibido tu comprobante. Tus números están en proceso de verificación."
            />

            <ErrorModal
                isOpen={!!errorModalMessage}
                onClose={() => setErrorModalMessage(null)}
                title="Error"
                message={errorModalMessage}
            />
        </div>
    );
};

export default RegistrarComprobante;