export function NumeroButton({ numero, estaApartado, estaSeleccionado, onClick }) {
  return (
    <button
      onClick={() => onClick(numero)}
      className={`
        flex items-center justify-center
        w-12 h-12 rounded-lg
        text-lg font-bold
        transition-all
        ${estaSeleccionado 
          ? 'bg-red-500 text-white shadow-md scale-105' 
          : estaApartado
            ? 'bg-white text-gray-700 border-2 border-red-400 hover:bg-red-50'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }
      `}
      disabled={!estaApartado}
    >
      {numero}
    </button>
  );
}