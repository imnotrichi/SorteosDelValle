import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormSection from '../components/formulario.jsx';
import Input, { TextArea } from '../components/input';
import FileUpload from '../components/subirImagen.jsx';
import SuccessModal from '../components/mensajeExito.jsx';
import addIcon from '../assets/añadir.png';
import ErrorModal from '../components/mensajeError.jsx';

const CLOUDINARY_CLOUD_NAME = "drczej3mh";
const CLOUDINARY_UPLOAD_PRESET = "imagenes_sorteosdelvalle";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const API_GATEWAY_URL = 'http://localhost:8080';


const CHAR_LIMITS = {
    TITULO: 255,
    DESCRIPCION: 2000,
    PREMIO_TITULO: 255,
    EMAIL: 50
};

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

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
        //console.error('Error en handleImageUpload:', error);
        throw error;
    }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    if (dateString.includes('T')) {
        return dateString.split('T')[0];
    }

    const fechaLimpia = dateString.split(',')[0].trim();

    const partes = fechaLimpia.split('/');

    if (partes.length === 3) {
        const [dia, mes, anio] = partes;
        return `${anio}-${mes}-${dia}`;
    }

    return '';
};

const convertirHorasADias = (horasString) => {
    if (!horasString || horasString === "00:00:00") return 0;
    const horas = parseInt(horasString.split(':')[0], 10);
    return Math.floor(horas / 24);
};

const convertirDiasAFormatoHoras = (dias) => {
    const diasNum = parseInt(dias, 10);
    if (isNaN(diasNum) || diasNum <= 0) return "00:00:00";
    const horas = diasNum * 24;
    return `${horas}:00:00`;
};

const EditarSorteo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [numerosVendidos, setNumerosVendidos] = useState(0);

    const [sorteoOriginal, setSorteoOriginal] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        imagen: null,
        rangoNumeros: '',
        precioNumero: '',
        fechaInicioVenta: '',
        fechaFinVenta: '',
        fechaRealizacion: '',
        tiempoLimiteApartado: '',
        tiempoRecordatorioPago: '',
    });

    const [premios, setPremios] = useState([]);
    const [organizadores, setOrganizadores] = useState([]);
    const [useGlobalConfig, setUseGlobalConfig] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSorteoData = async () => {
            try {
                const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/${id}`);
                if (!response.ok) {
                    throw new Error('Error al obtener los datos del sorteo');
                }

                const data = await response.json();

                setSorteoOriginal(data);
                setNumerosVendidos(data.numeros_vendidos);
                //console.log('Datos del sorteo obtenidos:', data);

                const configData = data.configuracionData;
                const usaGlobal = configData?.id === 1;

                setUseGlobalConfig(usaGlobal);

                setFormData({
                    titulo: data.titulo || '',
                    descripcion: data.descripcion || '',
                    imagen: null,
                    rangoNumeros: data.rango_numeros || '',
                    precioNumero: parseFloat(data.precio_numero) || '',
                    fechaInicioVenta: formatDateForInput(data.inicio_periodo_venta) || '',
                    fechaFinVenta: formatDateForInput(data.fin_periodo_venta) || '',
                    fechaRealizacion: formatDateForInput(data.fecha_realizacion) || '',
                    tiempoLimiteApartado: usaGlobal ? '0' : convertirHorasADias(configData?.tiempo_limite_apartado) || '',
                    tiempoRecordatorioPago: usaGlobal ? '0' : convertirHorasADias(configData?.tiempo_recordatorio_pago) || '',
                });

                setPremios((data.premiosData || []).map((p, idx) => ({
                    id: idx + 1,
                    id_api: p.id,
                    titulo: p.titulo,
                    imagen_premio_url: p.imagen_premio_url,
                    imagen: null
                })));

                setOrganizadores((data.organizadoresData || []).map((o, idx) => ({
                    id: idx + 1,
                    id_api: o.id,
                    email: o.correo
                })));

            } catch (error) {
                //console.error(error);
                setError("Error al obtener los datos del sorteo");
                setTimeout(() => navigate('/admin/misSorteos'), 2000);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchSorteoData();
    }, [id, navigate]);

    //TODO: Verificar esta parte ya que por el momento solo obtiene un true
    const hayBoletosVendidos = sorteoOriginal?.numeros_vendidos > 0;
    const minRangePermitido = hayBoletosVendidos ? sorteoOriginal.rango_numeros : 1;

    const isSorteoTerminado = (fechaRealizacion) => {
        const ahora = new Date();
        const fechaFin = new Date(fechaRealizacion);
        return ahora < fechaFin ? false : true;
    }


    const handleAnadirPremio = () => {
        const newId = premios.length + 1;
        setPremios([...premios, { id: newId, titulo: "", imagen: null }]);
    };

    const handleEliminarPremio = (id) => {
        if (premios.length > 1) {
            setPremios(premios.filter(p => p.id !== id));
        }
    };

    const handlePremioChange = (id, field, value) => {
        setPremios(premios.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    const handleAnadirOrganizador = () => {
        const newId = organizadores.length + 1;
        setOrganizadores([...organizadores, { id: newId, email: "" }]);
    };

    const handleEliminarOrganizador = (id) => {
        if (organizadores.length > 1) {
            setOrganizadores(organizadores.filter(o => o.id !== id));
        } else {
            alert("Debe haber al menos un organizador.");
        }
    };

    const handleOrganizadorChange = (id, value) => {
        setOrganizadores(organizadores.map(o =>
            o.id === id ? { ...o, email: value } : o
        ));
    };

    const handleGlobalConfigChange = () => {

        setUseGlobalConfig(!useGlobalConfig);
    };

    const handleConfigInputChange = (field, value) => {
        const numValue = parseInt(value, 10);
        const maxDias = 34;
        if (value === '' || (numValue >= 0 && numValue <= maxDias)) {
            setFormData({ ...formData, [field]: value });
        }
    };

    const handleRangoNumerosChange = (value) => {
        if (value === '' || !isNaN(value)) {
            setFormData({ ...formData, rangoNumeros: value });
        }
    };

    const handleBlur = () => {
        const valorNumerico = parseInt(formData.rangoNumeros, 10);
        if (!formData.rangoNumeros || valorNumerico < minRangePermitido) {
            setFormData({ ...formData, rangoNumeros: minRangePermitido });
        }
    };

    const handlePrecioNumeroChange = (value) => {
        const numValue = parseFloat(value);
        if (value === '' || (numValue > 0 && !isNaN(numValue))) {
            setFormData({ ...formData, precioNumero: value });
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getTomorrowDate = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const year = tomorrow.getFullYear();
        const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
        const day = tomorrow.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const getNextDay = (dateString) => {
        if (!dateString) {
            return getTomorrowDate();
        }

        const [year, month, day] = dateString.split('-').map(Number);
        const nextDay = new Date(year, month - 1, day);

        nextDay.setDate(nextDay.getDate() + 1);

        const nextYear = nextDay.getFullYear();
        const nextMonth = (nextDay.getMonth() + 1).toString().padStart(2, '0');
        const nextDayDate = nextDay.getDate().toString().padStart(2, '0');

        return `${nextYear}-${nextMonth}-${nextDayDate}`;
    };

    const handleFechaInicioVentaChange = (value) => {
        const hoy = getTodayDate();
        if (value >= hoy || value === formatDateForInput(sorteoOriginal.inicio_periodo_venta)) {
            setFormData({ ...formData, fechaInicioVenta: value });
        }
    };

    const handleFechaFinVentaChange = (value) => {
        const hoy = getTodayDate();
        if (value >= hoy && value >= formData.fechaInicioVenta) {
            setFormData({ ...formData, fechaFinVenta: value });
        }
    };

    const handleFechaRealizacionChange = (value) => {
        const minDate = getNextDay(formData.fechaFinVenta);
        if (value >= minDate) {
            setFormData({ ...formData, fechaRealizacion: value });
        }
    };

    const handleSorteoImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, imagen: file });
        }
    };

    const handlePremioImageChange = (id, e) => {
        const file = e.target.files[0];
        if (file) {
            handlePremioChange(id, 'imagen', file);
        }
    };

    const validateForm = () => {
        const today = getTodayDate();

        if (!formData.titulo.trim()) {
            setError('El título del sorteo es obligatorio.');
            return false;
        }
        if (formData.titulo.length > CHAR_LIMITS.TITULO) {
            setError(`El título no puede exceder los ${CHAR_LIMITS.TITULO} caracteres.`);
            return false;
        }
        if (!formData.descripcion.trim()) {
            setError('La descripción del sorteo es obligatoria.');
            return false;
        }
        if (formData.descripcion.length > CHAR_LIMITS.DESCRIPCION) {
            setError(`La descripción no puede exceder los ${CHAR_LIMITS.DESCRIPCION} caracteres.`);
            return false;
        }
        if (!formData.rangoNumeros || parseInt(formData.rangoNumeros, 10) < minRangePermitido) {
            setError(`El rango de números debe ser al menos ${minRangePermitido}.`);
            return false;
        }
        if (!formData.precioNumero || parseFloat(formData.precioNumero) < 1) {
            setError('El precio por número debe ser al menos 1.');
            return false;
        }
        if (!formData.fechaInicioVenta) {
            setError('La fecha de inicio de venta es obligatoria.');
            return false;
        }
        if (!formData.fechaFinVenta || formData.fechaFinVenta < formData.fechaInicioVenta) {
            setError('La fecha de fin de venta no puede ser anterior a la fecha de inicio.');
            return false;
        }
        if (!formData.fechaRealizacion || formData.fechaRealizacion <= formData.fechaFinVenta) {
            setError('La fecha de realización debe ser al menos un día después de la fecha de fin de venta.');
            return false;
        }

        if (premios.length === 0) {
            setError('Debe haber al menos un premio.');
            return false;
        }
        for (let premio of premios) {
            if (!premio.titulo.trim()) {
                setError('Todos los premios deben tener un título.');
                return false;
            }
        }

        if (organizadores.length === 0) {
            setError('Debe haber al menos un organizador.');
            return false;
        }
        for (let org of organizadores) {
            if (!org.email.trim()) {
                setError('Todos los organizadores deben tener un email válido.');
                return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(org.email)) {
                setError(`El email "${org.email}" no es válido.`);
                return false;
            }
        }

        if (!useGlobalConfig) {
            if (!formData.tiempoLimiteApartado || parseInt(formData.tiempoLimiteApartado, 10) <= 0) {
                setError('El tiempo límite de apartado debe ser mayor a 0.');
                return false;
            }
            if (!formData.tiempoRecordatorioPago || parseInt(formData.tiempoRecordatorioPago, 10) <= 0) {
                setError('El tiempo de recordatorio de pago debe ser mayor a 0.');
                return false;
            }
        }

        //console.log(error)
        return true;
    };


    const handleSubmit = async (e) => {
        //console.log("se ha presionado submit");
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            //console.log("error de formato");
            return;
        }

        setIsUploading(true);

        try {
            // 1. Manejo de imágenes
            const imagenSorteoUrl = formData.imagen
                ? await handleImageUpload(formData.imagen)
                : sorteoOriginal.imagen_url;

            const premiosConUrl = await Promise.all(
                premios.map(async (premio) => {
                    const imagenUrl = premio.imagen
                        ? await handleImageUpload(premio.imagen)
                        : premio.imagen_premio_url;

                    return {
                        ...(premio.id_api && { id: premio.id_api }),
                        titulo: premio.titulo,
                        imagen_premio_url: imagenUrl,
                    };
                })
            );

            const inicioOriginalSimple = formatDateForInput(sorteoOriginal.inicio_periodo_venta);
            const finOriginalSimple = formatDateForInput(sorteoOriginal.fin_periodo_venta);
            const realizacionOriginalSimple = formatDateForInput(sorteoOriginal.fecha_realizacion);

            //console.log("Comparando Inicio:", formData.fechaInicioVenta, "vs Original:", inicioOriginalSimple);


            const payload = {
                titulo: formData.titulo,
                descripcion: formData.descripcion,
                imagen_url: imagenSorteoUrl,
                rango_numeros: parseInt(formData.rangoNumeros, 10),
                precio_numero: parseFloat(formData.precioNumero),

                inicio_periodo_venta: `${formData.fechaInicioVenta}T00:00:00`,
                fin_periodo_venta: `${formData.fechaFinVenta}T00:00:00`,
                fecha_realizacion: `${formData.fechaRealizacion}T00:00:00`,
                configuracionData: {
                    global: useGlobalConfig,
                    tiempo_limite_apartado: useGlobalConfig ? "00:00:00" : convertirDiasAFormatoHoras(formData.tiempoLimiteApartado),
                    tiempo_recordatorio_pago: useGlobalConfig ? "00:00:00" : convertirDiasAFormatoHoras(formData.tiempoRecordatorioPago),
                    correoOrganizador: organizadores[0].email
                },
                premiosData: premiosConUrl,
                organizadoresData: organizadores.map(o => ({ correo: o.email }))
            };

            //console.log('Payload a enviar:', payload);

            const response = await fetch(`${API_GATEWAY_URL}/api/sorteos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();


            if (!response.ok) {
                throw new Error(result.message || 'Error al actualizar el sorteo');
            }

            //console.log('Sorteo actualizado con éxito:', result);
            setIsModalOpen(true);

        } catch (error) {
            //console.error('Error al actualizar el sorteo:', error);
            // Mostrar mensajes específicos del backend
            if (error.message.includes("No hay un organizador")) {
                setError(error.message);
            } else if (error.message.includes("No se puede modificar la fecha")) {
                setError("El servidor no permite cambiar la fecha de este sorteo (posiblemente ya está activo o tiene registros internos). Intenta dejar la fecha original.");
            }
            else if (error.message.includes("un organizador autorizado")) {
                setError(error.message)
            }
            else {
                setError("Ocurrió un error en el servidor");
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {

    };

    const handleCancelSalir = () => {
        navigate('/admin/misSorteos');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        navigate('/admin/misSorteos');
    };

    if (isLoadingData) {
        return <div className='p-8 text-center'>Cargando datos del sorteo...</div>;
    }

    const hoy = getTodayDate();
    const fechaOriginalInicio = sorteoOriginal ? formatDateForInput(sorteoOriginal.inicio_periodo_venta) : '';

    const minFechaInicioCalculada = (fechaOriginalInicio && fechaOriginalInicio < hoy)
        ? fechaOriginalInicio
        : hoy;
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-body">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-24">

                <h1 className="text-[32px] font-bold tracking-tight text-text-light">
                    Editar sorteo
                </h1>

                {hayBoletosVendidos && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="text-yellow-700">
                            ⚠️ Este sorteo ya tiene números vendidos. Algunos campos están bloqueados para proteger la integridad del sorteo.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <FormSection title="Información del sorteo">
                            <div className="grid grid-cols-1 gap-5">
                                <Input
                                    label="Título"
                                    value={formData.titulo}
                                    editing={true}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    maxLength={CHAR_LIMITS.TITULO}
                                    required
                                />
                                <TextArea
                                    label="Descripción"
                                    value={formData.descripcion}
                                    maxLength={CHAR_LIMITS.DESCRIPCION}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    required
                                />

                                {sorteoOriginal?.imagen_url && !formData.imagen && (
                                    <div>
                                        <span className="text-sm font-medium pb-2 block text-text-light">Imagen actual:</span>
                                        <img src={sorteoOriginal.imagen_url} alt="Imagen actual" className="w-full h-auto max-h-48 object-cover rounded-lg border border-border-light" />
                                    </div>
                                )}
                                <FileUpload
                                    label={sorteoOriginal?.imagen_url ? "Cambiar imagen" : "Imagen"}
                                    id="sorteo-imagen"
                                    onChange={handleSorteoImageChange}
                                    fileValue={formData.imagen}
                                />
                            </div>
                        </FormSection>

                        <FormSection title="Números">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Input
                                    label="Rango de números"
                                    type="number"
                                    value={formData.rangoNumeros}
                                    onChange={(e) => handleRangoNumerosChange(e.target.value)}
                                    min={minRangePermitido}
                                    helperText={hayBoletosVendidos ? `Mínimo: ${minRangePermitido}` : ''}
                                    required
                                    onBlur={handleBlur}
                                />
                                <Input
                                    label="Precio por número"
                                    type="number"
                                    step="0.01"
                                    value={formData.precioNumero}
                                    editing={hayBoletosVendidos}
                                    onChange={(e) => handlePrecioNumeroChange(e.target.value)}
                                    disabled={hayBoletosVendidos}
                                    required
                                />
                            </div>
                        </FormSection>

                        <FormSection title="Itinerario">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <Input
                                    label="Fecha de inicio de venta"
                                    type="date"
                                    value={formData.fechaInicioVenta}
                                    onChange={(e) => handleFechaInicioVentaChange(e.target.value)}
                                    min={minFechaInicioCalculada}
                                    disabled={hayBoletosVendidos}
                                    editing={hayBoletosVendidos}
                                    required
                                />
                                <Input
                                    label="Fecha de final de venta"
                                    type="date"
                                    value={formData.fechaFinVenta}
                                    //TODO:
                                    disabled={isSorteoTerminado(formData.fechaRealizacion)}
                                    onChange={(e) => handleFechaFinVentaChange(e.target.value)}
                                    min={getNextDay(formData.fechaInicioVenta)}
                                    required
                                />
                                <Input
                                    label="Fecha de realización"
                                    type="date"
                                    value={formData.fechaRealizacion}
                                    disabled={isSorteoTerminado(formData.fechaRealizacion)}
                                    onChange={(e) => handleFechaRealizacionChange(e.target.value)}
                                    min={getNextDay(formData.fechaFinVenta)}
                                    required
                                />
                            </div>
                        </FormSection>

                        <FormSection title="Premios">
                            <div className="flex flex-col gap-5">
                                {premios.map((premio, index) => (
                                    <div key={premio.id} className="flex flex-col gap-4 p-5 bg-card-light border border-border-light rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <p className="text-lg font-bold text-text-light">
                                                #{index + 1}
                                            </p>

                                            {premios.length > 1 && !hayBoletosVendidos && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminarPremio(premio.id)}
                                                    className="text-text-light/40 dark:text-text-dark/40 hover:text-red-500 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-2xl">delete</span>
                                                </button>
                                            )}
                                        </div>

                                        <Input
                                            label="Título"
                                            placeholder='ej. "Teclado Gamer marca Ocelot"'
                                            value={premio.titulo}
                                            onChange={(e) => handlePremioChange(premio.id, 'titulo', e.target.value)}
                                            maxLength={CHAR_LIMITS.PREMIO_TITULO}
                                            disabled={hayBoletosVendidos}
                                            required
                                        />

                                        {premio.imagen_premio_url && !premio.imagen && (
                                            <div className="flex flex-col gap-2">
                                                <span className="text-sm font-medium text-text-light">Imagen actual:</span>
                                                <img
                                                    src={premio.imagen_premio_url}
                                                    alt={`Premio ${index + 1}`}
                                                    className="w-full h-auto max-h-48 object-cover rounded-lg border border-border-light"
                                                />
                                            </div>
                                        )}

                                        <FileUpload
                                            label={premio.imagen_premio_url ? "Cambiar imagen" : "Imagen"}
                                            id={`premio-imagen-${premio.id}`}
                                            onChange={(e) => handlePremioImageChange(premio.id, e)}
                                            fileValue={premio.imagen}
                                            disabled={hayBoletosVendidos}
                                        />
                                    </div>
                                ))}

                                {!hayBoletosVendidos && (
                                    <button
                                        type="button"
                                        onClick={handleAnadirPremio} 
                                        className="flex items-center justify-center gap-2 w-full rounded-lg h-12 px-4 bg-button-add-light hover:bg-button-add-light/90 text-white text-sm font-bold transition-colors font-body"
                                    >
                                        <img src={addIcon} alt="Añadir" className="w-5 h-5 brightness-0 invert" />
                                        Añadir premio
                                    </button>
                                )}
                            </div>
                        </FormSection>
                    </div>

                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <FormSection title="Configuración">
                            <div>
                                <div className="flex flex-col gap-5">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-sm font-medium text-text-light dark:text-text-dark font-body">
                                            Usar configuración global
                                        </span>
                                        <div className="relative inline-block w-11 h-6">
                                            <input
                                                type="checkbox"
                                                id="config-toggle"
                                                className="sr-only peer"
                                                checked={useGlobalConfig}
                                                onChange={handleGlobalConfigChange}
                                            />
                                            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-primary transition-colors"></div>
                                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                                        </div>
                                    </label>

                                    {!useGlobalConfig && (
                                        <div className="grid grid-cols-1 gap-5 pt-2">
                                            <Input
                                                label="Tiempo límite de apartado"
                                                type="number"
                                                placeholder="ej. 7"
                                                helperText="días"
                                                min="1"
                                                max="34"
                                                value={formData.tiempoLimiteApartado}
                                                onChange={(e) => handleConfigInputChange('tiempoLimiteApartado', e.target.value)}
                                            />
                                            <Input
                                                label="Tiempo de recordatorio de pago"
                                                type="number"
                                                placeholder="ej. 3"
                                                helperText="días"
                                                min="1"
                                                max="34"
                                                value={formData.tiempoRecordatorioPago}
                                                onChange={(e) => handleConfigInputChange('tiempoRecordatorioPago', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Organizadores">
                            <div className="flex flex-col gap-5">
                                {organizadores.map((org, index) => (
                                    <div key={org.id} className="flex flex-col gap-2">
                                        <div className="flex items-start gap-2">
                                            <div className="flex-1">
                                                <Input
                                                    label={`#${index + 1}`}
                                                    type="email"
                                                    placeholder='ej. "diego.valenzuela247700@potros.itson.edu.mx"'
                                                    value={org.email}
                                                    onChange={(e) => handleOrganizadorChange(org.id, e.target.value)}
                                                    disabled={index === 0}
                                                    required
                                                />
                                            </div>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminarOrganizador(org.id)}
                                                    className="text-text-light/40 dark:text-text-dark/40 hover:text-red-500 transition-colors mt-8"
                                                >
                                                    <span className="material-symbols-outlined text-2xl">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAnadirOrganizador}
                                    className="flex items-center justify-center gap-2 w-full rounded-lg h-12 px-4 bg-button-add-light hover:bg-button-add-light/90 text-white text-sm font-bold transition-colors font-body"
                                >
                                    <img src={addIcon} alt="Añadir" className="w-5 h-5 brightness-0 invert" />
                                    Añadir organizador
                                </button>
                            </div>
                        </FormSection>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 z-10 bg-card-light/95 backdrop-blur-sm border-t border-border-light dark:border-border-dark font-body">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-end items-center gap-3">
                            <button
                                type="button"
                                onClick={handleCancelSalir}
                                className="flex items-center justify-center rounded-lg h-11 px-6 bg-border-light hover:bg-border-light/90 text-text-light dark:text-text-dark text-sm font-bold transition-colors"
                                disabled={isUploading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center justify-center rounded-lg h-11 px-6 bg-primary hover:bg-primary/90 text-text-dark text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                                disabled={isUploading}
                            >
                                {isUploading ? 'Guardando cambios...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </div>
                </div>

            </form>



            <SuccessModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    handleCancel();
                }}
                title="¡El sorteo se ha actualizado con éxito!"
            />

            <ErrorModal
                isOpen={!!error}
                onClose={() => setError(null)}
                message={error}
            />
        </div>
    );
}

export default EditarSorteo;
