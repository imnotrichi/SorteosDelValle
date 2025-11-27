import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png';

const IniciarSesion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: '',
    contrasenia: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {     
      console.log('Iniciando sesión:', formData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/');
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Correo o contraseña incorrectos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
      <div className="absolute top-8 right-8">
        <button
          onClick={() => navigate('/registrar-usuario')}
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-gray-800 rounded-lg font-bold transition-colors shadow-sm"
        >
          Registrarse
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Sorteos del Valle" className="h-35 w-auto" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-thin text-gray-800 mb-2">
            Tu suerte comienza al entrar
          </h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="example123@gmail.com"
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="contrasenia"
                value={formData.contrasenia}
                onChange={handleChange}
                placeholder="••••••••••••••••••••••••••"
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-gray-800 font-bold py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => navigate('/registrar-usuario')}
              className="text-green-600 hover:text-green-700 font-semibold underline"
            >
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default IniciarSesion;