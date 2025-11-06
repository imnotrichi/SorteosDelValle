import React, { useState } from 'react';

import Header from './components/header';
import FormSection from './components/formSection';
import Input, { TextArea } from './components/input';
import FileUpload from './components/fileUpload';
import SuccessModal from './components/successModal';

function App() {
  const [premios, setPremios] = useState([
    { id: 1, titulo: "", imagen_url: "" }
  ]);
  const [organizadores, setOrganizadores] = useState([
    { id: 1, email: "ej. diego.valenzuela247700@potros.itson.edu.mx" } 
  ]);
  const [useGlobalConfig, setUseGlobalConfig] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAñadirPremio = () => {
    const newId = premios.length + 1;
    setPremios([...premios, { id: newId, titulo: "", imagen_url: "" }]);
  };
  
  const handleAñadirOrganizador = () => {
    const newId = organizadores.length + 1;
    setOrganizadores([...organizadores, { id: newId, email: "" }]);
  };

  const handleCrearSorteo = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark">
      
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <form onSubmit={handleCrearSorteo} className="flex flex-col gap-8">
          
          <h1 className="text-4xl font-black tracking-[-0.033em]">
            Crear Sorteo
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              <FormSection title="Información del sorteo">
                <div className="grid grid-cols-1 gap-6">
                  <Input label="Título" placeholder="ej. Rifa de un teclado gamer marca Ocelot" required />
                  <TextArea label="Descripción" placeholder="¡Expresa en que consiste tu rifa!" required />
                  <FileUpload label="Imagen" id="sorteo-imagen" />
                </div>
              </FormSection>

              <FormSection title="Números">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input label="Rango de números" type="number" placeholder="ej. 62" required />
                  <Input label="Precio por número ($)" type="number" placeholder="ej. 30.00" step="0.01" required />
                </div>
              </FormSection>

              <FormSection title="Itinerario">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Input label="Inicio de venta" type="date" required />
                  <Input label="Fin de venta" type="date" required />
                  <Input label="Fecha de sorteo" type="date" required />
                </div>
              </FormSection>

              <FormSection title="Premios">
                <div className="flex flex-col gap-6">
                  {premios.map((premio, index) => (
                    <div key={premio.id} className="flex flex-col gap-4 p-4 border border-border-light dark:border-border-dark rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold">#{index + 1}</p>
                        {index > 0 && (
                          <button type="button" className="text-text-light/60 hover:text-red-500">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        )}
                      </div>
                      <Input label="Título" placeholder="ej. Teclado Gamer marca Ocelot" required />
                      <FileUpload label="Imagen" id={`premio-imagen-${premio.id}`} />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAñadirPremio}
                    className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-lg h-12 px-4 bg-primary/20 hover:bg-primary/30 text-sm font-bold"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    Añadir premio
                  </button>
                </div>
              </FormSection>

            </div>

            <div className="lg:col-span-1 flex flex-col gap-8">
              
              <FormSection title="Configuración">
                <div className="flex flex-col gap-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-base font-medium">Usar configuración global</span>
                    <div className="relative inline-block w-10 align-middle">
                      <input
                        type="checkbox"
                        id="config-toggle"
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        checked={useGlobalConfig}
                        onChange={() => setUseGlobalConfig(!useGlobalConfig)}
                      />
                      <label htmlFor="config-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </label>

                  {!useGlobalConfig && (
                    <div className="grid grid-cols-1 gap-4 pt-4">
                      <Input label="Tiempo límite de apartado (días)" type="number" placeholder="ej. 7" />
                      <Input label="Tiempo de recordatorio de pago (días)" type="number" placeholder="ej. 3" />
                    </div>
                  )}
                </div>
              </FormSection>
              
              <FormSection title="Organizadores">
                <div className="flex flex-col gap-6">
                  {organizadores.map((org, index) => (
                    <div key={org.id} className="flex items-center gap-4">
                      <label className="flex flex-col grow">
                        <span className="text-base font-medium pb-2">Correo electrónico #{index + 1}</span>
                        <input
                          type="email"
                          placeholder={org.email}
                          className="form-input rounded-lg bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark"
                          required
                        />
                      </label>
                      {index > 0 && (
                        <button type="button" className="text-text-light/60 hover:text-red-500 mt-8">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAñadirOrganizador}
                    className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-lg h-12 px-4 bg-primary/20 hover:bg-primary/30 text-sm font-bold"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    Añadir organizador
                  </button>
                </div>
              </FormSection>
              
            </div>
          </div>
          
          <footer className="sticky bottom-0 z-10 w-full bg-card-light/90 dark:bg-card-dark/90 backdrop-blur-sm border-t border-border-light dark:border-border-dark py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="max-w-7xl mx-auto flex justify-end items-center gap-4">
              <button type="button" className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary/20 text-base font-bold hover:bg-primary/30">
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary text-text-light text-base font-bold hover:opacity-90"
              >
                Crear sorteo
              </button>
            </div>
          </footer>

        </form>
      </main>
      
      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default App;