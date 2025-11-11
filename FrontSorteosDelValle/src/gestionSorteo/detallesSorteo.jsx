import React, { useState } from "react";
const DetallesSorteo = () => {
  const [sorteoData] = useState({
    titulo: "Rifa Smart TV. ¡Mira!",
    imagen:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=400&fit=crop",
    boletosVendidos: 150,
    boletosRestantes: 50,
    pagoGenerado: 1500.0,
    descripcion:
      "Disfruta de la mejor experiencia visual con nuestra Smart TV de última generación. Con una pantalla de alta definición, acceso a aplicaciones de streaming y conectividad inteligente, esta TV transformará tu sala en un cine en casa. ¡No te pierdas la oportunidad de ganar este increíble premio!",
    rangoNumeros: "001 - 500",
    PrecioPorNumero: 100.0,
    fechaInicio: "2024-01-01",
    fechaFin: "2024-02-01",
    fechaSorteo: "2024-02-05",
    premios: [
      {
        id: 1,
        titulo: "Smart TV 3999-pro max",
        imagen:
          "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
      },
      {
        id: 2,
        titulo: "Smart TV 3999-pro max",
        imagen:
          "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
      },
      {
        id: 3,
        titulo: "Smart TV 3999-pro max",
        imagen:
          "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
      },
    ],
  });

  return (
    <div className="min-h-screen ">
      <div className="border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Titulo y botones */}

          <div className="flex items-center justify-between">
            <div className="border-amber-700">
              <h1 className="text-2xl font-bold text-text-light">
                Detalles de sorteo
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Administra los detalles, boletos y estado de tu sorteo
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-400 hover:bg-green-500 text-gray-900 rounded-lg flex items-center gap-2 font-medium transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Editar
              </button>
              <button className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-gray-900 rounded-lg flex items-center gap-2 font-medium transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Ver boletos
              </button>
              <button className="px-4 py-2 bg-red-400 hover:bg-red-500 text-gray-900 rounded-lg flex items-center gap-2 font-medium transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Imagen */}
        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img
            src={sorteoData.imagen}
            alt={sorteoData.titulo}
            className="w-full h-80 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h2 className="text-3xl font-bold text-white">
              {sorteoData.titulo}
            </h2>
          </div>
        </div>

        {/* estadisticas Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Boletos vendidos</p>
            <p className="text-4xl font-bold text-gray-900">
              {sorteoData.boletosVendidos}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Boletos restantes</p>
            <p className="text-4xl font-bold text-gray-900">
              {sorteoData.boletosRestantes}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Pago generado</p>
            <p className="text-4xl font-bold text-gray-900">
              ${sorteoData.pagoGenerado.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Premios*/}
        <div className=" border border-amber-700">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Premios</h3>
          <div className="min-w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorteoData.premios.map((premio) => (
              <div
                key={premio.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 "
              >
                <div className="border border-blue-700 relative rounded-t-lg overflow-hidden">
                  <img
                    src={premio.imagen}
                    alt={premio.titulo}
                    className="w-full h-48 object-cover group-hover:scale-105"
                  />
                </div>

                <div className="border border-amber-600 min-h-10 flex items-center px-3">
                  <p className=" border text-sm font-medium text-gray-900">
                    {premio.titulo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border border-amber-700 p-4 rounded-xl bg-white shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Detalles</h3>

          {/* Datos del sorteo*/}
          <div className="inline-block ">
            <div className=" border border-amber-600">
              <p className="max-w-60 border border-b-fuchsia-700">Descripción</p>
              <p className="text-sm text-gray-500">{sorteoData.descripcion}</p>
            </div>

            <div className=" border border-amber-600">
              <p className="max-w-60 border border-b-fuchsia-700">Rango de números</p>
              <p className="text-sm text-gray-500">{sorteoData.rangoNumeros}</p>
            </div>

            <div className="border border-amber-600">
              <p className="max-w-60 border border-b-fuchsia-700">Precio por número</p>
              <p className="text-sm text-gray-500">
                ${sorteoData.PrecioPorNumero.toFixed(2)}
              </p>
            </div>

            <div className="border border-amber-600">
              <p className="max-w-60 border border-b-fuchsia-700">Fecha de inicio</p>
              <p className="text-sm text-gray-500">{sorteoData.fechaInicio}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesSorteo;
