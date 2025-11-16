import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderCliente from '../components/headerCliente';
import { SorteoCardCliente } from '../components/sorteoCardCliente';

const mockSorteos = [
  {
    id: 1,
    titulo: "Rifa de Xbox",
    imagen_url: "https://m.media-amazon.com/images/I/71AtLTRlT2L._AC_UF1000,1000_QL80_.jpg",
    precioNumero: 50.00,
  },
  {
    id: 2,
    titulo: "Viaje de ensueño: Playa paradisiaca te llama.",
    imagen_url: "https://media.gq.com.mx/photos/620e915c43f71a078a35533f/master/pass/playa.jpg",
    precioNumero: 200.00,
  },
  {
    id: 3,
    titulo: "Cocina nueva: cocina para tu hogar.",
    imagen_url: "https://www.viacelere.com/wp-content/uploads/old-blog/2017/10/tipos-de-cocina_opt.jpg",
    precioNumero: 80.00,
  },
  {
    id: 4,
    titulo: "Rifa Kit Gamer. ¡Domina!",
    imagen_url: "https://www.cyberpuerta.mx/img/product/M/CP-NACEBTECHNOLOGY-NA-0934-7e92f0.jpg",
    precioNumero: 30.00,
  },
  {
    id: 5,
    titulo: "Rifa Smart TV. ¡Mira!",
    imagen_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=400&fit=crop",
    precioNumero: 100.00,
  },
  {
    id: 6,
    titulo: "Rifa Bicicleta Pro. ¡Explora!",
    imagen_url: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800&h=400&fit=crop",
    precioNumero: 20.00,
  },
  {
    id: 7,
    titulo: "Rifa Laptop Ultra. ¡Crea!",
    imagen_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=400&fit=crop",
    precioNumero: 50.00,
  },
  {
    id: 8,
    titulo: "Rifa Auriculares Premium. ¡Escucha!",
    imagen_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=400&fit=crop",
    precioNumero: 10.00,
  }
];

const Inicio = () => {
  const navigate = useNavigate();
  const [sorteos] = useState(mockSorteos);

  return (
    <div className="min-h-screen bg-background-light">
      <HeaderCliente onNavigate={navigate} userName="Ricardo" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-[32px] font-bold tracking-tight text-text-light mb-8">
          Inicio
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sorteos.map((sorteo) => (
            <SorteoCardCliente
              key={sorteo.id}
              sorteo={sorteo}
              onClick={() => navigate(`/sorteo/${sorteo.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inicio;