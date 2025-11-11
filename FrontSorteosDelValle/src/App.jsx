import React, { useState } from "react";
import "./index.css";
import Header from "./components/header.jsx";
import CrearSorteo from "./GestionSorteo/crearSorteo.jsx";
import MisSorteos from "./gestionSorteo/misSorteos.jsx";
import DetallesSorteo from "./gestionSorteo/detallesSorteo.jsx";  

const MainLayout = ({ children, onNavigate }) => {
  return (
    <div className="min-h-screen bg-background-light font-display text-text-light">
      <Header onNavigate={onNavigate} />
      <main>{children}</main>
    </div>
  );
};

function App() {
  //NOTE: Si quieren probar otra página, cambienle el valor de useState
  const [paginaActual, setPaginaActual] = useState("detallesSorteo");

  const navegarA = (pagina) => {
    setPaginaActual(pagina);
  };

  const renderizarPagina = () => {
    if (paginaActual === "misSorteos") {
      return <MisSorteos onNavigate={navegarA} />;
    } else if (paginaActual === "crearSorteo") {
      return <CrearSorteo onNavigate={navegarA} />;
    }
     else if (paginaActual === "detallesSorteo") {
      return <DetallesSorteo onNavigate={navegarA} />;
    }
    //TODO: Aquí se agregan todas las paginas
  };
  return <MainLayout onNavigate={navegarA}>{renderizarPagina()}</MainLayout>;
}

export default App;
