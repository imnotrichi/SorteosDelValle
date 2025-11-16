import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderCliente from '../components/headerCliente';
import { NumeroButton } from '../components/numeroButton';
import { ResumenCompraCard } from '../components/resumenCompraCard';

const mockSorteoData = {
  id: 5,
  titulo: "Rifa Smart TV. ¡Mira!",
  rangoNumeros: 196,
  precioNumero: 100.00
};

const NumerosSorteo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sorteoData] = useState(mockSorteoData);
  const [numerosSeleccionados, setNumerosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const handleSeleccionarNumero = (numero) => {
    if (numerosSeleccionados.includes(numero)) {
      setNumerosSeleccionados(numerosSeleccionados.filter(n => n !== numero));
    } else {
      setNumerosSeleccionados([...numerosSeleccionados, numero]);
    }
  };

  const handleCancelar = () => {
    navigate(`/sorteo/${id}`);
  };

  const handleApartarNumeros = () => {
    if (numerosSeleccionados.length === 0) {
      alert('Debes seleccionar al menos un número');
      return;
    }

    alert(`${numerosSeleccionados.length} número(s) apartado(s) exitosamente`);
    console.log('Números seleccionados:', numerosSeleccionados);
  };

  const renderNumeros = () => {
    if (!sorteoData) return null;

    const numeros = [];
    const rangoNumeros = sorteoData.rangoNumeros;
    const numFilas = Math.ceil(rangoNumeros / 14);

    for (let i = 0; i < numFilas; i++) {
      const fila = [];
      for (let j = 1; j <= 14; j++) {
        const numero = i * 14 + j;
        if (numero > rangoNumeros) break;

        const estaSeleccionado = numerosSeleccionados.includes(numero);
        const estaDisponible = true;

        fila.push(
          <NumeroButton
            key={numero}
            numero={numero}
            estaSeleccionado={estaSeleccionado}
            estaDisponible={estaDisponible}
            onClick={handleSeleccionarNumero}
          />
        );
      }
      numeros.push(
        <div key={i} className="flex gap-3 justify-start">
          {fila}
        </div>
      );
    }

    return numeros;
  };

  const total = numerosSeleccionados.length * sorteoData.precioNumero;

  return (
    <div className="min-h-screen bg-background-light pb-32">
      <HeaderCliente onNavigate={navigate} userName="Ricardo" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancelar}
              className="flex items-center justify-center px-6 h-12 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <span className="text-base font-bold text-text-light">
                Cancelar
              </span>
            </button>
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-text-light">
                Números de {sorteoData.titulo}
              </h1>
              <p className="text-sm text-gray-600">
                Seleccione los números que desea apartar
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white border-2 border-gray-300"></div>
                  <span className="text-sm text-gray-600">Número libre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary"></div>
                  <span className="text-sm text-gray-600">Número seleccionado</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar número:"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full rounded-lg bg-background-light border border-border-light text-text-light placeholder:text-text-light/40 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors h-12 pl-10 pr-4"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {renderNumeros()}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <ResumenCompraCard
              precioNumero={sorteoData.precioNumero}
              numerosSeleccionados={numerosSeleccionados}
              total={total}
              onApartar={handleApartarNumeros}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumerosSorteo;