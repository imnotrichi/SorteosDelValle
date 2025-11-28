import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrarUsuarioCard from '../components/registrarUsuarioCard';
import Input from '../components/input';
import HeaderRegistro from '../components/headerRegistro';

const RegistrarUsuario = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombres: '',
        correo: '',
        contrasenia: '',
        telefono: '',
        fechaNacimiento: '',
    });

    const handleSubmit = () => {
        console.log('Formulario enviado:', formData);
    };

    const MAX_LENGTHS = {
        nombres: 100,
        correo: 255,
        contrasenia: 100,
        telefono: 10,
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

            // Ajuste del cursor
            const newCursorPosition = selectionStart + textToPasteTruncated.length;
            setTimeout(() => {
                target.setSelectionRange(newCursorPosition, newCursorPosition);
                if (newCursorPosition === newValue.length) {
                    target.scrollLeft = target.scrollWidth;
                }
            }, 0);

        } catch (error) {
            // Fallback simple
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

            <div className="flex items-center justify-center p-4 relative">
                <RegistrarUsuarioCard>
                    <div className="flex flex-col gap-5">
                        
                        {/* Primera fila: Nombre y Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleChange}
                                onPaste={handlePasteGeneral} // Usa el handler complejo
                                maxLength={MAX_LENGTHS.nombres}
                                label="Nombre completo"
                                placeholder="Ingresa tu nombre completo"
                            />

                            <Input
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                onPaste={handlePasteGeneral} // Usa el handler complejo
                                maxLength={MAX_LENGTHS.correo}
                                label="Correo electrónico"
                                placeholder="Ingresa tu correo electrónico"
                                type="email"
                            />
                        </div>

                        {/* Segunda fila: Contraseña y Teléfono */}
                        <div className="grid grid-cols-2 gap-4">
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
                                onPaste={handlePasteGeneral} // Usa el handler complejo
                                maxLength={MAX_LENGTHS.telefono}
                                label="Número de teléfono"
                                placeholder="Ingresa tu número de teléfono"
                                type="tel"
                            />
                        </div>

                        {/* Tercera fila: Fecha de nacimiento */}
                        <div className="w-full">
                            <Input
                                label="Fecha nacimiento"
                                placeholder="Selecciona tu fecha de nacimiento"
                                type="date"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="bg-primary hover:bg-green-500 text-gray-800 font-bold w-full py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg mt-2 text-base"
                        >
                            Registrar
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