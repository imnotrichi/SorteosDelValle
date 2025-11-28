
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

        <div className="p-3 flex items-center flex-1">
        <p className="text-lg font-medium text-gray-900 break-words w-full text-balance">
          {titulo}
        </p>
      </div>
    </div>

    )
}


