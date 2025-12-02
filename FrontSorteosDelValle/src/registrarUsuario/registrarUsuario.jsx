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

    const MAX_LENGTHS = {
        nombres: 100,
        correo: 100,
        contrasenia: 128,
        telefono: 10,
    };

    const today = new Date().toISOString().split('T')[0];

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
        return regex.test(password);
    };

    const handleSubmit = async () => {
        if (!formData.contrasenia || !formData.correo || !formData.nombres || !formData.fechaNacimiento || !formData.telefono) {
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

        if (!validatePassword(formData.contrasenia)) {
            setErrorMessage(
                "La contraseña es muy débil. Debe tener al menos 10 caracteres, una mayúscula, un número y un carácter especial."
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
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al registrar usuario.');
            }

            setShowSuccessModal(true);

        } catch (error) {
            console.error('Error de registro:', error);
            setErrorMessage(error.message);
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
        <div className="min-h-screen bg-background-light">
            <HeaderRegistro />
            
            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Error de Registro"
                message={errorMessage}
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleCloseSuccess}
                title="¡Registro Exitoso!"
            />

            <div className="flex items-center justify-center p-4 relative pb-20">
                <RegistrarUsuarioCard>
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleChange}
                                onPaste={handlePasteGeneral}
                                maxLength={MAX_LENGTHS.nombres}
                                label="Nombre(s)"
                                placeholder="Ingresa tu nombre(s)"
                            />

                            <Input
                                name="apellidoPaterno"
                                value={formData.apellidoPaterno}
                                onChange={handleChange}
                                onPaste={handlePasteGeneral}
                                maxLength={MAX_LENGTHS.nombres}
                                label="Apellido Paterno"
                                placeholder="Ingresa apellido paterno"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                name="apellidoMaterno"
                                value={formData.apellidoMaterno}
                                onChange={handleChange}
                                onPaste={handlePasteGeneral}
                                maxLength={MAX_LENGTHS.nombres}
                                label="Apellido Materno"
                                placeholder="Ingresa apellido materno"
                            />

                            <Input
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                onPaste={handlePasteGeneral}
                                maxLength={MAX_LENGTHS.correo}
                                label="Correo electrónico"
                                placeholder="Ingresa tu correo electrónico"
                                type="email"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    name="contrasenia"
                                    value={formData.contrasenia}
                                    onChange={handleChange}
                                    onPaste={handleBlockPassword}
                                    onCopy={handleBlockPassword}
                                    onCut={handleBlockPassword}
                                    maxLength={MAX_LENGTHS.contrasenia}
                                    label="Contraseña"
                                    placeholder="Crea una contraseña fuerte"
                                    type="password"
                                />
                            </div>

                            <Input
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                onPaste={handlePasteGeneral}
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
                            className="bg-primary hover:bg-green-500 text-gray-800 font-bold w-full py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg mt-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrar'}
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-1">
                            ¿Ya estás registrado?{' '}
                            <button
                                onClick={() => navigate('/iniciar-sesion')}
                                className="text-green-500 hover:text-green-600 font-semibold underline">
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