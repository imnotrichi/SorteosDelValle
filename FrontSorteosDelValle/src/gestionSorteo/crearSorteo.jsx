import React, { useState } from 'react';
import FormSection from '../components/formulario.jsx';
import Input, { TextArea } from '../components/input';
import FileUpload from '../components/subirImagen.jsx';
import SuccessModal from '../components/mensajeExito.jsx';
import addIcon from '../assets/añadir.png';

const API_GATEWAY_URL = 'http://localhost:8080';

const CrearSorteo = () => {
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
    { id: 1, email: "" }
  ]);

  const [useGlobalConfig, setUseGlobalConfig] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      imagen_url: "https://ejemplo.com/imagen-sorteo.png", //tengo q cambiar esto
      rango_numeros: parseInt(formData.rangoNumeros, 10),
      precio_numero: parseFloat(formData.precioNumero),
      inicio_periodo_venta: formData.fechaInicioVenta,
      fin_periodo_venta: formData.fechaFinVenta,
      fecha_realizacion: formData.fechaRealizacion,
      organizadores: organizadores.map(o => o.email), //TENGO Q CAMBIAR ESTO TAMBIEN
      
      premiosData: premios.map(p => ({
        titulo: p.titulo,
        imagen_premio_url: `https://ejemplo.com/premio-${p.id}.png` //que no se me olvide cambiar esto
      })),
      id_configuracion: 1, //esto tambn lo tengo q checar
      // Si !useGlobalConfig, debería enviar los tiempos al backend
      // para que él cree una nueva configuración y use ese id
    };

    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/sorteos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear el sorteo');
      }

      console.log('Sorteo creado:', result);
      setIsModalOpen(true);

    } catch (error) {
      console.error('Error en handleSubmit:', error.message);
      // hola aquí vamos a manejar el error, tengo q hacer un modal d error bleeeeh
      alert(`Error: ${error.message}`);
    }
  };

  const handleCancel = () => {
    // hola aquí va a ir la lógica de cancelar, aquí debería limpiar el formulario o redirigir a otra página
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-body">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-24">
        
        <h1 className="text-[32px] font-extrabold tracking-tight text-text-light">
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
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required 
                />
                <TextArea 
                  label="Descripción" 
                  placeholder="¡Expresa en que consiste tu rifa para que las personas quieran comparte números!" 
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  required 
                />
                <FileUpload 
                  label="Imagen" 
                  id="sorteo-imagen"
                  onChange={(file) => setFormData({...formData, imagen: file})}
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
                  onChange={(e) => setFormData({...formData, rangoNumeros: e.target.value})}
                  required 
                />
                <Input 
                  label="Precio por número" 
                  type="number" 
                  placeholder="ej. $30.00" 
                  step="0.01" 
                  value={formData.precioNumero}
                  onChange={(e) => setFormData({...formData, precioNumero: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, fechaInicioVenta: e.target.value})}
                  required 
                />
                <Input 
                  label="Fecha de final de venta" 
                  type="date"
                  value={formData.fechaFinVenta}
                  onChange={(e) => setFormData({...formData, fechaFinVenta: e.target.value})}
                  required 
                />
                <Input 
                  label="Fecha de realización" 
                  type="date"
                  value={formData.fechaRealizacion}
                  onChange={(e) => setFormData({...formData, fechaRealizacion: e.target.value})}
                  required 
                />
              </div>
            </FormSection>

            <FormSection title="Premios">
              <div className="flex flex-col gap-5">
                {premios.map((premio, index) => (
                  <div key={premio.id} className="flex flex-col gap-4 p-5 bg-background-light border border-border-light rounded-lg">
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
                      onChange={(file) => handlePremioChange(premio.id, 'imagen', file)}
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
                      onChange={() => setUseGlobalConfig(!useGlobalConfig)}
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
                      value={formData.tiempoLimiteApartado}
                      onChange={(e) => setFormData({...formData, tiempoLimiteApartado: e.target.value})}
                    />
                    <Input 
                      label="Tiempo de recordatorio de pago" 
                      type="number" 
                      placeholder="ej. 3"
                      helperText="días"
                      value={formData.tiempoRecordatorioPago}
                      onChange={(e) => setFormData({...formData, tiempoRecordatorioPago: e.target.value})}
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
                          label={`#${index + 1}`}
                          type="email"
                          placeholder='ej. "diego.valenzuela247700@potros.itson.edu.mx"'
                          value={org.email}
                          onChange={(e) => handleOrganizadorChange(org.id, e.target.value)}
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
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg h-11 px-6 bg-primary hover:bg-primary/90 text-text-dark text-sm font-bold transition-colors shadow-sm"
              >
                Crear sorteo
              </button>
            </div>
          </div>
        </div>

      </form>
      
      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="¡El sorteo se ha creado con éxito!"
      />
    </div>
  );
};

export default CrearSorteo;