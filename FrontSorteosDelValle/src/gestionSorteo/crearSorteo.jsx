import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormSection from '../components/formulario.jsx';
import Input, { TextArea } from '../components/input';
import FileUpload from '../components/subirImagen.jsx';
import SuccessModal from '../components/mensajeExito.jsx';
import ErrorModal from '../components/mensajeError.jsx';
import ConfirmationModal from '../components/mensajeConfirmacion.jsx';
import addIcon from '../assets/añadir.png';

const CLOUDINARY_CLOUD_NAME = "drczej3mh";
const CLOUDINARY_UPLOAD_PRESET = "imagenes_sorteosdelvalle";

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const API_GATEWAY_URL = 'http://localhost:8080';

const CHAR_LIMITS = {
  TITULO: 255,
  DESCRIPCION: 255,
  PREMIO_TITULO: 255,
  EMAIL: 50
};

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const handleImageUpload = async (file) => {
  if (!file) {
    return null;
  }

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
    console.error('');
    throw error;
  }
};

const CrearSorteo = ({ currentUserEmail }) => {
  const navigate = useNavigate();
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

  const [premios, setPremios] = useState([
    { id: 1, titulo: "", imagen: null }
  ]);

  const [organizadores, setOrganizadores] = useState([
    { id: 1, email: currentUserEmail }
  ]);

  const [useGlobalConfig, setUseGlobalConfig] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const [error, setError] = useState(null);

  const handleAñadirPremio = () => {
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

  const handleAñadirOrganizador = () => {
    const newId = organizadores.length + 1;
    setOrganizadores([...organizadores, { id: newId, email: "" }]);
  };

  const handleEliminarOrganizador = (id) => {
    if (organizadores.length > 1) {
      setOrganizadores(organizadores.filter(o => o.id !== id));
    }
  };

  const handleOrganizadorChange = (id, value) => {
    setOrganizadores(organizadores.map(o =>
      o.id === id ? { ...o, email: value } : o
    ));
  };

  const handleGlobalConfigChange = () => {
    if (!useGlobalConfig) {
      setFormData({
        ...formData,
        tiempoLimiteApartado: '0',
        tiempoRecordatorioPago: '0',
      });
    } else {
      setFormData({
        ...formData,
        tiempoLimiteApartado: '',
        tiempoRecordatorioPago: '',
      });
    }
    setUseGlobalConfig(!useGlobalConfig);
  };

  const handleConfigInputChange = (field, value) => {
    if (value !== '' && !/^(0|[1-9][0-9]*)$/.test(value)) {
      return;
    }
    
    const numValue = parseInt(value, 10);
    const maxPermitido = maxDiasDinamic; 

    if (value === '' || (numValue >= 0 && numValue <= maxPermitido)) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleRangoNumerosChange = (value) => {
    const isValidLength = /^\d{0,5}$/.test(value);
    
    if (value === '' || (isValidLength && parseInt(value, 10) > 0)) {
      setFormData({ ...formData, rangoNumeros: value });
    }
  };

  const handlePrecioNumeroChange = (value) => {
    const regex = /^\d{0,5}(\.\d{0,2})?$/;

    if (value === '' || regex.test(value)) {
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
    const today = getTodayDate();

    if (value >= today) {
      setFormData({ ...formData, fechaInicioVenta: value });
    }
  };

  const handleFechaFinVentaChange = (value) => {
    const tomorrow = getTomorrowDate();
    if (value >= tomorrow && value >= formData.fechaInicioVenta) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);

    try {
      const imagenSorteoUrl = await handleImageUpload(formData.imagen);

      let horaInicio = "00:00:00";
      const fechaHoy = getTodayDate();

      if (formData.fechaInicioVenta === fechaHoy) {
        const ahora = new Date();
        ahora.setMinutes(ahora.getMinutes() + 5);
        
        const horas = ahora.getHours().toString().padStart(2, '0');
        const minutos = ahora.getMinutes().toString().padStart(2, '0');
        const segundos = ahora.getSeconds().toString().padStart(2, '0');
        
        horaInicio = `${horas}:${minutos}:${segundos}`;
      }

      const premiosConUrl = await Promise.all(
        premios.map(async (premio) => {
          const imagenUrl = await handleImageUpload(premio.imagen);
          return {
            titulo: premio.titulo,
            imagen_premio_url: imagenUrl,
          };
        })
      );

      const convertirDiasAFormatoHoras = (diasString) => {
        const dias = parseInt(diasString, 10);
        if (isNaN(dias) || dias <= 0) {
          return "00:00:00";
        }
        const horas = dias * 24;
        return `${horas}:00:00`;
      };

      const configuracionData = {
        global: useGlobalConfig,
        tiempo_limite_apartado: useGlobalConfig
          ? "00:00:00"
          : convertirDiasAFormatoHoras(formData.tiempoLimiteApartado),
        tiempo_recordatorio_pago: useGlobalConfig
          ? "00:00:00"
          : convertirDiasAFormatoHoras(formData.tiempoRecordatorioPago),

        correoOrganizador: organizadores[0].email
      };

      const organizadoresData = organizadores.map(o => ({ correo: o.email }));

      const payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        imagen_url: imagenSorteoUrl,
        rango_numeros: parseInt(formData.rangoNumeros, 10),
        precio_numero: parseFloat(formData.precioNumero, 10),
        inicio_periodo_venta: `${formData.fechaInicioVenta}T${horaInicio}`,
        fin_periodo_venta: `${formData.fechaFinVenta}T00:00:00`,
        fecha_realizacion: `${formData.fechaRealizacion}T00:00:00`,
        configuracionData: configuracionData,
        premiosData: premiosConUrl,
        organizadoresData: organizadoresData
      };

      const response = await fetch(`${API_GATEWAY_URL}/api/sorteos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'Inténtelo nuevamente.';
        try {
             const errorData = await response.json();
             if (errorData.message === 'Ya existe un sorteo con ese título.') {
                 errorMessage = 'Ya existe un sorteo registrado con ese título. Por favor, ingrese uno diferente.';
             } else {
                 errorMessage = errorData.message || errorMessage;
             }
        } catch (e) {
             console.error("");
        }
        throw new Error(errorMessage);
      }
      setIsModalOpen(true);

    } catch (error) {
      console.error('');
      let msg = error.message;
      
      if (msg === 'Failed to fetch' || msg.includes('NetworkError')) {
        msg = "No se pudo conectar con el servidor. Verifique su conexión.";
      }
      
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
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

    setPremios([
      { id: 1, titulo: "", imagen: null }
    ]);

    setOrganizadores([
      { id: 1, email: currentUserEmail }
    ]);

    setUseGlobalConfig(false);
    setIsModalOpen(false);
    setIsCancelModalOpen(false);
    setError(null);
    navigate(-1);
  };

  const handleCancelClick = () => {
    const hasBasicData =
      formData.titulo.trim() !== '' ||
      formData.descripcion.trim() !== '' ||
      formData.imagen !== null ||
      formData.rangoNumeros !== '' ||
      formData.precioNumero !== '' ||
      formData.fechaInicioVenta !== '' ||
      formData.fechaFinVenta !== '' ||
      formData.fechaRealizacion !== '' ||
      (!useGlobalConfig && (formData.tiempoLimiteApartado !== '' || formData.tiempoRecordatorioPago !== ''));

    const hasPremiosData =
      premios.length > 1 ||
      premios[0].titulo.trim() !== '' ||
      premios[0].imagen !== null;

    const hasOrganizadoresData =
      organizadores.length > 1 ||
      organizadores[0].email !== currentUserEmail;

    const hasConfigChanged = useGlobalConfig === true;

    if (hasBasicData || hasPremiosData || hasOrganizadoresData || hasConfigChanged) {
      setIsCancelModalOpen(true);
    } else {
      handleCancel();
    }
  };

  const checkFileValidity = (file, contextName) => {
    if (!file) return null;
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `El formato de las imágenes seleccionadas no es válido. Solo JPG o PNG.`;
    }
    
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `Las imágenes seleccionadas son muy pesadas. Máximo ${MAX_FILE_SIZE_MB}MB.`;
    }
    
    return null;
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
    if (!formData.imagen) {
      setError('La imagen principal del sorteo es obligatoria.');
      return false;
    }
    const errorImagenPrincipal = checkFileValidity(formData.imagen, "Portada del Sorteo");
    if (errorImagenPrincipal) {
      setError(errorImagenPrincipal);
      return false;
    }
    if (!formData.rangoNumeros || parseInt(formData.rangoNumeros, 10) < 1) {
      setError('El rango de números debe ser un número mayor a 0.');
      return false;
    }
    if (parseInt(formData.rangoNumeros, 10) > 99999) {
      setError('El rango de números no puede exceder 99,999.');
      return false;
    }
    if (!formData.precioNumero || parseFloat(formData.precioNumero) < 1) {
      setError('El precio por número debe ser al menos 1.');
      return false;
    }
    const precio = parseFloat(formData.precioNumero);
    if (precio > 99999.99) {
      setError('El precio por número no puede exceder $99,999.99.');
      return false;
    }
    if (!formData.fechaInicioVenta || formData.fechaInicioVenta < today) {
      setError('La fecha de inicio de venta debe ser hoy o una fecha futura.');
      return false;
    }
    if (!formData.fechaFinVenta || formData.fechaFinVenta < formData.fechaInicioVenta) {
      setError('La fecha de fin de venta no puede ser anterior a la fecha de inicio.');
      return false;
    }
    if (!formData.fechaRealizacion || formData.fechaRealizacion < formData.fechaFinVenta) {
      setError('La fecha de realización no puede ser anterior a la fecha de fin de venta.');
      return false;
    }
    if (formData.fechaRealizacion <= formData.fechaFinVenta) {
      alert('La fecha de realización debe ser al menos un día después de la fecha de fin de venta.');
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
      if (premio.titulo.length > CHAR_LIMITS.PREMIO_TITULO) {
        setError(`El título del premio #${premio.id} es muy largo (máximo ${CHAR_LIMITS.PREMIO_TITULO} caracteres).`);
        return false;
      }
      if (!premio.imagen) {
        setError(`El premio "${premio.titulo || '#' + premio.id}" debe tener una imagen.`);
        return false;
      }
      const errorImagenPremio = checkFileValidity(premio.imagen, `Premio: ${premio.titulo}`);
      if (errorImagenPremio) {
        setError(errorImagenPremio);
        return false;
      }
    }
    if (organizadores.length === 0) {
      setError('Debe haber al menos un organizador.');
      return false;
    }

    const emailsList = organizadores.map(o => o.email.trim().toLowerCase());
    const uniqueEmails = new Set(emailsList);
    
    if (emailsList.length !== uniqueEmails.size) {
      setError('No puedes agregar el mismo organizador más de una vez.');
      return false;
    }
    for (let org of organizadores) {
      if (!org.email.trim()) {
        setError('Todos los organizadores deben tener un email válido.');
        return false;
      }
      if (org.email.length > CHAR_LIMITS.EMAIL) {
        setError(`El email del organizador #${org.id} es demasiado largo.`);
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(org.email)) {
        setError(`El email "${org.email}" no es válido.`);
        return false;
      }
    }

    if (!useGlobalConfig) {
      const tiempoApartado = parseInt(formData.tiempoLimiteApartado, 10);
      const tiempoRecordatorio = parseInt(formData.tiempoRecordatorioPago, 10);

      if (!formData.tiempoLimiteApartado || parseInt(formData.tiempoLimiteApartado, 10) <= 0) {
        setError('El tiempo límite de apartado debe ser un número mayor a 0 si no usas la configuración global.');
        return false;
      }

      if (formData.fechaInicioVenta && formData.fechaFinVenta) {
        const inicio = new Date(formData.fechaInicioVenta);
        const fin = new Date(formData.fechaFinVenta);
        const diferenciaTiempo = fin.getTime() - inicio.getTime();
        const duracionDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

        if (tiempoApartado > duracionDias) {
          setError(`El tiempo de apartado (${tiempoApartado} días) no puede ser mayor a la duración de la venta (${duracionDias} días).`);
          return false;
        }
      }
      if (tiempoRecordatorio >= tiempoApartado) {
        setError('El recordatorio de pago debe ser menor al tiempo límite de apartado (ej. Apartado: 7 días, Recordatorio: 3 días).');
        return false;
      }
    }
    if (parseInt(formData.tiempoLimiteApartado, 10) > maxDiasDinamic) {
       setError(`El tiempo límite excede el máximo permitido de ${maxDiasDinamic} días.`);
       return false;
    }

    return true;
  };

  const calcularMaxDiasPermitidos = () => {
    if (formData.fechaInicioVenta && formData.fechaFinVenta) {
      const inicio = new Date(formData.fechaInicioVenta);
      const fin = new Date(formData.fechaFinVenta);
      const diffTiempo = fin - inicio;
      const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
      
      if (diffDias > 0) {
        return Math.min(diffDias, 34);
      }
    }
    return 34;
  };

  const maxDiasDinamic = calcularMaxDiasPermitidos();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-body">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-24">

        <h1 className="text-[32px] font-bold tracking-tight text-text-light">
          Crear sorteo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 flex flex-col gap-6">

            <FormSection title="Información del sorteo">
              <div className="grid grid-cols-1 gap-5">
                <Input
                  label="Título"
                  placeholder='ej. "Rifa de un teclado gamer marca Ocelot"'
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  maxLength={CHAR_LIMITS.TITULO}
                  required
                />
                <TextArea
                  label="Descripción"
                  placeholder="¡Expresa en que consiste tu rifa para que las personas quieran comprarte números!"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  maxLength={CHAR_LIMITS.DESCRIPCION}
                  required
                />

                <FileUpload
                  label="Imagen"
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
                  placeholder="ej. 62"
                  value={formData.rangoNumeros}
                  onChange={(e) => handleRangoNumerosChange(e.target.value)}
                  min="1"
                  max="99999"
                  onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                  required
                />
                <Input
                  label="Precio por número"
                  type="number"
                  placeholder="ej. $30.00"
                  step="0.01"
                  value={formData.precioNumero}
                  onChange={(e) => handlePrecioNumeroChange(e.target.value)}
                  min="0.01"
                  max="99999.99"
                  onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
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
                  min={getTodayDate()}
                  required
                />
                <Input
                  label="Fecha de final de venta"
                  type="date"
                  value={formData.fechaFinVenta}
                  onChange={(e) => handleFechaFinVentaChange(e.target.value)}
                  min={getNextDay(formData.fechaInicioVenta)}
                  required
                />
                <Input
                  label="Fecha de realización"
                  type="date"
                  value={formData.fechaRealizacion}
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
                      {index > 0 && (
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
                      required
                    />

                    <FileUpload
                      label="Imagen"
                      id={`premio-imagen-${premio.id}`}
                      onChange={(e) => handlePremioImageChange(premio.id, e)}
                      fileValue={premio.imagen}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAñadirPremio}
                  className="flex items-center justify-center gap-2 w-full rounded-lg h-12 px-4 bg-button-add-light hover:bg-button-add-light/90 text-white text-sm font-bold transition-colors font-body"
                >
                  <img src={addIcon} alt="Añadir" className="w-5 h-5 brightness-0 invert" />
                  Añadir premio
                </button>
              </div>
            </FormSection>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">

            <FormSection title="Configuración">
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
                      max={maxDiasDinamic}
                      value={formData.tiempoLimiteApartado}
                      onChange={(e) => handleConfigInputChange('tiempoLimiteApartado', e.target.value)}
                    />
                    <Input
                      label="Tiempo de recordatorio de pago"
                      type="number"
                      placeholder="ej. 3"
                      helperText="días"
                      min="0"
                      max="34"
                      value={formData.tiempoRecordatorioPago}
                      onChange={(e) => handleConfigInputChange('tiempoRecordatorioPago', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </FormSection>

            <FormSection title="Organizadores">
              <div className="flex flex-col gap-5">
                {organizadores.map((org, index) => (
                  <div key={org.id} className="flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          label={index === 0 ? "#1" : `#${index + 1}`}
                          type="email"
                          placeholder='ej. "diego.valenzuela247700@potros.itson.edu.mx"'
                          value={org.email}
                          onChange={(e) => handleOrganizadorChange(org.id, e.target.value)}
                          maxLength={CHAR_LIMITS.EMAIL}
                          required
                          disabled={index === 0}
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
                  onClick={handleAñadirOrganizador}
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
                onClick={handleCancelClick}
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
                {isUploading ? 'Creando...' : 'Crear sorteo'}
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
        title="¡El sorteo se ha creado con éxito!"
      />

      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        title={'Error al crear sorteo'}
        message={error}
      />

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="¿Deseas cancelar?"
        message="Si sales ahora, perderás todos los datos que has ingresado para este sorteo."
      />
    </div>
  );
};

export default CrearSorteo;