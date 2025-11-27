
const RegistrarUsuarioCard = ({ children }) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lvh w-full">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
                Crear una cuenta
            </h2>
            <p className="text-gray-600 text-center mb-8 text-sm">
                Únete a sorteos del valle para empezar a participar
            </p>
            {children}
        </div>
    );
};

export default RegistrarUsuarioCard;