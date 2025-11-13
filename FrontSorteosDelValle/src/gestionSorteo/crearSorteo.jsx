import React, { useState } from 'react';
import FormSection from '../components/formulario.jsx';
import Input, { TextArea } from '../components/input';
import FileUpload from '../components/subirImagen.jsx';
import SuccessModal from '../components/mensajeExito.jsx';
import ErrorModal from '../components/mensajeError.jsx';
import addIcon from '../assets/añadir.png';

const CLOUDINARY_CLOUD_NAME = "drczej3mh";
const CLOUDINARY_UPLOAD_PRESET = "imagenes_sorteosdelvalle";

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const API_GATEWAY_URL = 'http://localhost:8080';

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
    console.error('Error en handleImageUpload:', error);
    throw error;
  }
};

const CrearSorteo = ({ currentUserEmail }) => {
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
    const numValue = parseInt(value, 10);
    const maxDias = 34;

    if (value === '' || (numValue >= 0 && numValue <= maxDias)) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleRangoNumerosChange = (value) => {
    const numValue = parseInt(value, 10);
    if (value === '' || (numValue > 0 && !isNaN(numValue))) {
      setFormData({ ...formData, rangoNumeros: value });
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

  const handleFechaInicioVentaChange = (value) => {
    const today = getTodayDate();
    if (value >= today) {
      setFormData({ ...formData, fechaInicioVenta: value });
    }
  };

  const handleFechaFinVentaChange = (value) => {
    const today = getTodayDate();
    if (value >= today && value >= formData.fechaInicioVenta) {
      setFormData({ ...formData, fechaFinVenta: value });
    }
  };

  const handleFechaRealizacionChange = (value) => {
    const today = getTodayDate();
    if (
      value >= today &&
      value >= formData.fechaInicioVenta &&
      value >= formData.fechaFinVenta
    ) {
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
        inicio_periodo_venta: `${formData.fechaInicioVenta}T23:59:59`,
        fin_periodo_venta: `${formData.fechaFinVenta}T23:59:59`,
        fecha_realizacion: `${formData.fechaRealizacion}T23:59:59`,
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear sorteo');
      }
      setIsModalOpen(true);

    } catch (error) {
      console.error('Error al crear sorteo:', error);
      setError(error.message);
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
    setError(null);
  };

  const validateForm = () => {
    const today = getTodayDate();

    if (!formData.titulo.trim()) {
      setError('El título del sorteo es obligatorio.');
      return false;
    }
    if (!formData.descripcion.trim()) {
      setError('La descripción del sorteo es obligatoria.');
      return false;
    }
    if (!formData.imagen) {
      setError('La imagen principal del sorteo es obligatoria.');
      return false;
    }
    if (!formData.rangoNumeros || parseInt(formData.rangoNumeros, 10) < 1) {
      setError('El rango de números debe ser un número mayor a 0.');
      return false;
    }
    if (!formData.precioNumero || parseFloat(formData.precioNumero) < 1) {
      setError('El precio por número debe ser al menos 1.');
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
    if (formData.fechaRealizacion < formData.fechaFinVenta) {
      alert('La fecha de realización no puede ser anterior a la fecha de fin de venta.');
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
      if (!premio.imagen) {
        setError('Todos los premios deben tener una imagen.');
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
        setError('El tiempo límite de apartado debe ser un número mayor a 0 si no usas la configuración global.');
        return false;
      }
      if (!formData.tiempoRecordatorioPago || parseInt(formData.tiempoRecordatorioPago, 10) <= 0) {
        setError('El tiempo de recordatorio de pago debe ser un número mayor a 0 si no usas la configuración global.');
        return false;
      }
    }

    const maxDias = 34;
      if (parseInt(formData.tiempoLimiteApartado, 10) > maxDias || parseInt(formData.tiempoRecordatorioPago, 10) > maxDias) {
        alert(`El tiempo máximo permitido es de ${maxDias} días.`);
        return false;
      }

    return true;
  };

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
                  required
                />
                <TextArea
                  label="Descripción"
                  placeholder="¡Expresa en que consiste tu rifa para que las personas quieran comparte números!"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
                  min={formData.fechaInicioVenta}
                  required
                />
                <Input
                  label="Fecha de realización"
                  type="date"
                  value={formData.fechaRealizacion}
                  onChange={(e) => handleFechaRealizacionChange(e.target.value)}
                  min={formData.fechaFinVenta}
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
                onClick={handleCancel}
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
        message={error}
      />
    </div>
  );
};

export default CrearSorteo;