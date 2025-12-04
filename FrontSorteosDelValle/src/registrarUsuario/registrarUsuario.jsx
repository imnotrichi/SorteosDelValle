import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrarUsuarioCard from '../components/registrarUsuarioCard';
import Input from '../components/input';
import HeaderRegistro from '../components/headerRegistro';
import ErrorModal from '../components/mensajeError';
import SuccessModal from '../components/mensajeExito';

const API_GATEWAY_URL = 'http://localhost:8080';

const RegistrarUsuario = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        correo: '',
        contrasenia: '',
        telefono: '',
        fechaNacimiento: ''
    });

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const MAX_LENGTHS = {
        nombres: 100,
        correo: 100,
        contrasenia: 128,
        telefono: 10,
    };

    const today = new Date().toISOString().split('T')[0];

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-=+.?]).{10,}$/;
        return regex.test(password);
    };

    const validateEmailFormat = (email) => {
        const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        const consecutiveSpecialChars = /[._-]{2,}/;

        return basicRegex.test(email) && !consecutiveSpecialChars.test(email);
    };

    const calculateAge = (birthDateString) => {
        if (!birthDateString) return 0;
        const [year, month, day] = birthDateString.split('-').map(Number);
        const birthDate = new Date(year, month - 1, day);
        const todayDate = new Date();
        
        let age = todayDate.getFullYear() - birthDate.getFullYear();
        const m = todayDate.getMonth() - birthDate.getMonth();
        
        if (m < 0 || (m === 0 && todayDate.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmit = async () => {
        const dataToSend = {
            ...formData,
            nombres: formData.nombres.trim(),
            apellidoPaterno: formData.apellidoPaterno.trim(),
            apellidoMaterno: formData.apellidoMaterno.trim(),
            correo: formData.correo.trim(),
            contrasenia: formData.contrasenia.trim()
        };

        if (dataToSend.nombres.length < 2 || dataToSend.apellidoPaterno.length < 2) {
            setErrorMessage("Los nombres y apellidos deben tener al menos 2 caracteres.");
            setShowErrorModal(true);
            return;
        }

        if (!dataToSend.contrasenia || !dataToSend.correo || !dataToSend.nombres || !dataToSend.apellidoPaterno || !formData.fechaNacimiento || !formData.telefono) {
            setErrorMessage("Por favor completa los campos obligatorios.");
            setShowErrorModal(true);
            return;
        }

        const fechaSeleccionada = new Date(formData.fechaNacimiento);
        if (fechaSeleccionada > new Date()) {
            setErrorMessage("La fecha de nacimiento no puede ser una fecha futura.");
            setShowErrorModal(true);
            return;
        }

        const edad = calculateAge(formData.fechaNacimiento);
        if (edad < 18) {
            setErrorMessage("Debes ser mayor de 18 años para registrarte.");
            setShowErrorModal(true);
            return;
        }

        if (edad > 122) {
            setErrorMessage("Ingresa una fecha de nacimiento válida.");
            setShowErrorModal(true);
            return;
        }

        if (formData.telefono.length !== 10) {
            setErrorMessage("El número de teléfono debe tener exactamente 10 dígitos.");
            setShowErrorModal(true);
            return;
        }

        if (!validateEmailFormat(dataToSend.correo)) {
            setErrorMessage("El formato del correo electrónico es inválido.");
            setShowErrorModal(true);
            return;
        }

        if (!validatePassword(dataToSend.contrasenia)) {
            setErrorMessage(
                "La contraseña debe de contener al menos 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
            );
            setShowErrorModal(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_GATEWAY_URL}/api/usuarios/registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            let data = {};
            try {
                data = await response.json();
            } catch (e) {
            }

            if (!response.ok) {
                const msgBackend = (data.message || '').toLowerCase();

                if (msgBackend.includes("correo") || msgBackend.includes("email")) {
                    throw new Error("DUPLICATE_EMAIL");
                }
                if (msgBackend.includes("teléfono") || msgBackend.includes("telefono")) {
                    throw new Error("DUPLICATE_PHONE");
                }
                if (response.status === 400) {
                    throw new Error("INVALID_DATA");
                }

                throw new Error("SERVER_ERROR");
            }

            setShowSuccessModal(true);

        } catch (error) {
            let friendlyMessage = "No se pudo completar el registro. Por favor, inténtalo de nuevo más tarde.";

            if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
                friendlyMessage = "Parece que ha habido un problema, inténtalo de nuevo más tarde.";
            } else if (error.message === "DUPLICATE_EMAIL") {
                friendlyMessage = "El correo electrónico ingresado se encuentra en uso, inicia sesión o ingresa un correo diferente.";
            } else if (error.message === "DUPLICATE_PHONE") {
                friendlyMessage = "El número de teléfono ingresado se encuentra en uso, inicia sesión o ingresa un teléfono diferente.";
            } else if (error.message === "INVALID_DATA") {
                friendlyMessage = "Llena todos los campos de la manera solicitada.";
            }

            setErrorMessage(friendlyMessage);
            setShowErrorModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        navigate('/iniciar-sesion');
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (['nombres', 'apellidoPaterno', 'apellidoMaterno'].includes(name)) {
            if (value !== '' && !/^[a-zA-Z\u00C0-\u00FF\s-]+$/.test(value)) {
                return;
            }
        }

        if (name === 'telefono') {
            if (value !== '' && !/^\d+$/.test(value)) {
                return;
            }
        }

        if (name === 'correo') {
            if (value !== '' && !/^[a-zA-Z0-9@._-]+$/.test(value)) {
                return;
            }
        }

        const maxLength = MAX_LENGTHS[name];
        const newValue = (maxLength && value.length > maxLength)
            ? value.slice(0, maxLength)
            : value;

        setFormData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };

    const handleBlockPassword = (event) => {
        event.preventDefault();
        return false;
    };

    const handlePasteGeneral = (event) => {
        const target = event.target;
        const { name, value } = target;

        if (name === 'contrasenia') {
            event.preventDefault();
            return;
        }

        event.preventDefault();

        const maxLength = MAX_LENGTHS[name];
        if (!maxLength) return;

        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text');

        try {
            const selectionStart = target.selectionStart || 0;
            const selectionEnd = target.selectionEnd || 0;
            const selectedTextLength = selectionEnd - selectionStart;
            const availableSpace = maxLength - (value.length - selectedTextLength);
            const textToPasteTruncated = pastedText.slice(0, availableSpace);

            const newValue =
                value.substring(0, selectionStart) +
                textToPasteTruncated +
                value.substring(selectionEnd);

            setFormData(prevData => ({
                ...prevData,
                [name]: newValue
            }));

            const newCursorPosition = selectionStart + textToPasteTruncated.length;
            setTimeout(() => {
                target.setSelectionRange(newCursorPosition, newCursorPosition);
                if (newCursorPosition === newValue.length) {
                    target.scrollLeft = target.scrollWidth;
                }
            }, 0);

        } catch (error) {
            const availableSpace = maxLength - value.length;
            const textToPasteTruncated = pastedText.slice(0, availableSpace);
            setFormData(prevData => ({
                ...prevData,
                [name]: value + textToPasteTruncated
            }));
        }
    };

    return (
        <div className="min-h-screen bg-background-light font-body">
            <HeaderRegistro />

            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="¡Atención!"
                message={errorMessage}
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleCloseSuccess}
                title="¡Su cuenta se ha creado con éxito!"
            />

            <div className="flex items-center justify-center p-4 relative pb-20">
                <RegistrarUsuarioCard>
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleChange}
                                maxLength={MAX_LENGTHS.nombres}
                                label="Nombre(s)"
                                placeholder="Ingresa tu nombre(s)"
                            />

                            <Input
                                name="apellidoPaterno"
                                value={formData.apellidoPaterno}
                                onChange={handleChange}
                                maxLength={MAX_LENGTHS.nombres}
                                label="Apellido paterno"
                                placeholder="Ingresa apellido paterno"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                name="apellidoMaterno"
                                value={formData.apellidoMaterno}
                                onChange={handleChange}
                                maxLength={MAX_LENGTHS.nombres}
                                label="Apellido materno"
                                placeholder="Ingresa apellido materno"
                            />

                            <Input
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                maxLength={MAX_LENGTHS.correo}
                                label="Correo electrónico"
                                placeholder="Ingresa tu correo electrónico"
                                type="email"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <div className="flex flex-col">
                                <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Contraseña</span>
                                <div className="relative">
                                    <input
                                        name="contrasenia"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.contrasenia}
                                        onChange={handleChange}
                                        onPaste={handleBlockPassword}
                                        onCopy={handleBlockPassword}
                                        maxLength={MAX_LENGTHS.contrasenia}
                                        placeholder="Crea una contraseña fuerte"
                                        className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark placeholder:text-text-light/40 dark:placeholder:text-text-dark/40 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors h-11 px-3 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center cursor-pointer"
                                        tabIndex="-1"
                                    >
                                        <span className="material-symbols-outlined text-2xl select-none">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <Input
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                maxLength={MAX_LENGTHS.telefono}
                                label="Número de teléfono"
                                placeholder="Ingresa tu número de teléfono"
                                type="tel"
                            />
                        </div>

                        <div className="w-full">
                            <Input
                                name="fechaNacimiento"
                                value={formData.fechaNacimiento}
                                onChange={handleChange}
                                label="Fecha nacimiento"
                                placeholder="Selecciona tu fecha de nacimiento"
                                type="date"
                                max={today}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-green-500 text-gray-800 font-bold w-full py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg mt-2 text-base disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrar'}
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-1">
                            ¿Ya estás registrado?{' '}
                            <button
                                onClick={() => navigate('/iniciar-sesion')}
                                className="text-green-500 hover:text-green-600 font-semibold underline cursor-pointer">
                                Inicia sesión
                            </button>
                        </p>
                    </div>
                </RegistrarUsuarioCard>
            </div>
        </div>
    );
};

export default RegistrarUsuario;