import { useEffect, useState } from 'react'

function App() {
  const [sorteo, setSorteo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fíjate que ya no usamos 'http://localhost:3000'
    // 2. Vite ve '/api/sorteos/...' y lo redirige al puerto 3000 por ti.
    //    (Estoy usando la ruta de tus pruebas)
    
    fetch('/api/sorteos/buscar?titulo=Camioneta%20F-150%20modelo%202025')
      .then(res => {
        if (!res.ok) {
          throw new Error('Error al buscar el sorteo');
        }
        return res.json();
      })
      .then(data => {
        // Basado en tu DAO, la respuesta tiene { sorteo, premios }
        setSorteo(data.sorteo); 
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al obtener el sorteo:", err);
        setLoading(false);
      });
  }, []); // El array vacío asegura que esto se ejecute solo una vez

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 p-8">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h1 className="text-center text-3xl font-bold text-gray-800">
          Sorteos del Valle
        </h1>
        
        {loading && <p className="mt-4 text-center text-gray-500">Cargando sorteo...</p>}

        {sorteo && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-blue-600">{sorteo.titulo}</h2>
            <p className="mt-2 text-gray-700">{sorteo.descripcion}</p>
            <p className="mt-4 text-right text-3xl font-bold text-green-600">
              ${sorteo.precio_numero} MXN
            </p>
          </div>
        )}

        {!loading && !sorteo && <p className="mt-4 text-center text-red-500">No se pudo encontrar el sorteo.</p>}
      </div>
    </div>
  )
}

export default App