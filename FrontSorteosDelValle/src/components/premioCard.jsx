
export function PremioCard({ id, titulo, imagen }) {

    return (<div
        key={id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 "
    >
        <div className="relative rounded-t-lg overflow-hidden">
            <img
                src={imagen}
                alt={titulo}
                className="w-full h-48 object-cover group-hover:scale-105"
            />
        </div>

        <div className=" min-h-10 flex items-center px-3">
            <p className=" text-sm font-medium text-gray-900">
                {titulo}
            </p>
        </div>
    </div>

    )
}


