const DetallesSorteoCard = ({ descripcion, rangoNumeros, PrecioPorNumero, fechaInicio }) => {
    return (
        <div className="p-6 rounded-2xl bg-white shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Información</h3>

            {/* Datos del sorteo */}
            <div className="space-y-4">
                <div className="flex border-b border-gray-300 pb-4">
                    <p className="w-48 text-gray-500 font-medium">Descripción</p>
                    <p className="flex-1 text-gray-900 font-medium">{descripcion}</p>
                </div>

                <div className="flex border-b border-gray-300 pb-4">
                    <p className="w-48 text-gray-500 font-medium">Rango de números</p>
                    <p className="flex-1 text-gray-900 font-medium">{rangoNumeros}</p>
                </div>

                <div className="flex border-b border-gray-300 pb-4">
                    <p className="w-48 text-gray-500 font-medium">Precio por número</p>
                    <p className="flex-1 text-gray-900 font-medium">${PrecioPorNumero}</p>
                </div>

                <div className="flex pb-4">
                    <p className="w-48 text-gray-500 font-medium">Fechas de inicio</p>
                    <p className="flex-1 text-gray-900 font-medium">
                         {fechaInicio} 
                    </p>
                </div>
            </div>
        </div>
    )
}

export default DetallesSorteoCard;