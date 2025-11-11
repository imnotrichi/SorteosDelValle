
export function PremioCard({ id, titulo, imagen }) {
    <div
        key={id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 "
    >
        <div className="border border-blue-700 relative rounded-t-lg overflow-hidden">
            <img
                src={imagen}
                alt={titulo}
                className="w-full h-48 object-cover group-hover:scale-105"
            />
        </div>

        <div className="border border-amber-600 min-h-10 flex items-center px-3">
            <p className=" border text-sm font-medium text-gray-900">
                {titulo}
            </p>
        </div>
    </div>
}


