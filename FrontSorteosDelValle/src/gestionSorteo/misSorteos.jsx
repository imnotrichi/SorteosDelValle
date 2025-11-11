import { SorteoCard } from "../components/sorteoCard";
const MisSorteos = ({ onNavigate }) => {
  const mockSorteos = [
    {
      id: 1,
      titulo: "Rifa de Xbox",
      imagen:
        "https://m.media-amazon.com/images/I/71AtLTRlT2L._AC_UF1000,1000_QL80_.jpg",
      estado: "Activo",
    },
    {
      id: 2,
      titulo: "Viaje de ensueño. Playa paradisiaca te llama",
      imagen:
        "https://media.gq.com.mx/photos/620e915c43f71a078a35533f/master/pass/playa.jpg",
      estado: "Activo",
    },
    {
      id: 3,
      titulo: "Cocina nueva cocina para tu hogar",
      imagen:
        "https://www.viacelere.com/wp-content/uploads/old-blog/2017/10/tipos-de-cocina_opt.jpg",
      estado: "Finalizado",
    },
    {
      id: 4,
      titulo: "Rifa kit gamer",
      imagen:
        "https://www.cyberpuerta.mx/img/product/M/CP-NACEBTECHNOLOGY-NA-0934-7e92f0.jpg",
      estado: "Finalizado",
    },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-body">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[32px] font-bold tracking-tight text-text-light">
          Mis Sorteos
        </h1>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockSorteos.map((sorteo) => (
          <SorteoCard
            key={sorteo.id}
            sorteo={sorteo}
            onEditarClick={() => onNavigate("editarSorteo", sorteo.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MisSorteos;
