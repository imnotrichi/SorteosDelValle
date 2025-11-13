const DetallesSorteoCard = ({ descripcion, rangoNumeros, PrecioPorNumero, fechaInicio }) => {
    return (
        <div className="mt-8 p-4 rounded-xl bg-white shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Detalles</h3>

            {/* Datos del sorteo*/}
            <div className="inline-block ">
                <div className="flex border-b-2 border-border-light" >
                    <p className="max-w-60  min-w-50 ">Descripción</p>
                    <p className="text-sm text-gray-500">{descripcion}</p>
                </div>

                <div className="flex border-b-2 border-border-light" >
                    <p className="max-w-60 min-w-50  ">Rango de números</p>
                    <p className="text-sm text-gray-500">{rangoNumeros}</p>
                </div>

                <div className="flex border-b-2 border-border-light">
                    <p className="max-w-60 min-w-50  ">Precio por número</p>
                    <p className="text-sm text-gray-500">
                        ${PrecioPorNumero.toFixed(2)}
                    </p>
                </div>

                <div className="flex border-b-2 border-border-light">
                    <p className="max-w-60 min-w-50  ">Fecha de inicio</p>
                    <p className="text-sm text-gray-500">{fechaInicio}</p>
                </div>

            </div>
        </div>
    )
}

export default DetallesSorteoCard;