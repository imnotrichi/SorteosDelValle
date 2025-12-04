import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png';
import ErrorModal from '../components/mensajeError';
import SuccessModal from '../components/mensajeExito';
import { useAuth } from './AuthContext';

const API_GATEWAY_URL = 'http://localhost:8080';

const IniciarSesion = () => {
  const navigate = useNavigate();
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    correo: '',
    contrasenia: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    correo: '',
    contrasenia: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const MAX_LENGTH = 50;

  const removeEmojis = (string) => {
    return string.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let cleanValue = removeEmojis(value);

    if (cleanValue.length > MAX_LENGTH) {
      cleanValue = cleanValue.slice(0, MAX_LENGTH);
    }

    setFormData(prev => ({
      ...prev,
      [name]: cleanValue
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.correo.trim()) {
      errors.correo = 'El correo es obligatorio.';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo)) {
        errors.correo = 'Ingresa un correo electrónico válido.';
        isValid = false;
      }
    }

    if (!formData.contrasenia.trim()) {
      errors.contrasenia = 'La contraseña es obligatoria.';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }


    setIsLoading(true);
    setGlobalError(null);

    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setIsLoading(true);
      if (!response.ok) {

        if (response.status === 400 || response.status === 401 || response.status === 404) {
          throw new Error("Correo o contraseña incorrectos.");
        }
        throw new Error("Ocurrió un problema con el servicio. Intenta más tarde.");

      }
      const usuario = {
        idusuario: data.id_usuario,
        correo: data.correo,
        nombres: data.nombres,
        tipoUsuario: data.tipoUsuario
      }

      //localStorage.setItem('token', data.token);
      //localStorage.setItem('usuario', JSON.stringify(usuario));

      login(usuario, data.token)

    } catch (error) {

      let friendlyMessage = "Ocurrió un error inesperado";
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
        friendlyMessage = "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e inténtalo de nuevo.";
      }

      else if (error.message === "Correo o contraseña incorrectos." || error.message === "Ocurrió un problema con el servicio. Intenta más tarde.") {
        friendlyMessage = error.message;

      }

      else {
        friendlyMessage = "No se pudo iniciar sesión. Por favor intenta nuevamente.";
      }

      setErrorMessage(friendlyMessage);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="¡Atención!"
        message={errorMessage}
      />

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

        {globalError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-sm text-red-700">{globalError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="text"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="example123@gmail.com"
              className={`w-full px-4 py-3 rounded-lg bg-gray-50 border text-gray-800 placeholder:text-gray-400 focus:ring-2 transition-colors
                ${fieldErrors.correo
                  ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary/30 focus:border-primary'
                }`}
            />
            {fieldErrors.correo && (
              <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.correo}</p>
            )}
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
                className={`w-full px-4 py-3 rounded-lg bg-gray-50 border text-gray-800 placeholder:text-gray-400 focus:ring-2 transition-colors pr-12
                  ${fieldErrors.contrasenia
                    ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary/30 focus:border-primary'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-2xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {fieldErrors.contrasenia && (
              <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.contrasenia}</p>
            )}
          </div>

          <button
            type="submit"
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
        </form>
      </div>
    </div>
  );
};

export default IniciarSesion;