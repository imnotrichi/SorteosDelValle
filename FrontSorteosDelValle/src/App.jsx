import React, { use, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"; // 1. Importa los componentes de rutas
import "./index.css";
import Header from "./components/header.jsx";
import CrearSorteo from "./gestionSorteo/crearSorteo.jsx";
import MisSorteos from "./gestionSorteo/misSorteos.jsx";
import DetallesSorteo from "./gestionSorteo/detallesSorteo.jsx";
//Aun no existe import EditarSorteo from "./gestionSorteo/editarSorteo.jsx";
//TODO: IMPORTAR COMPONENTE DE EDICION
//TODO: EditarSorteo
const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background-light font-display text-text-light">
      <Header onNavigate={navigate} />
      <main>{children}</main>
    </div>
  );
};

function App() {

  const [currentUser] = useState({
    email: "abel@example.com" 
  });

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<MisSorteos />} />
        <Route 
          path="/crearSorteo" 
          element={<CrearSorteo currentUserEmail={currentUser.email} />} 
        />
        <Route path="/misSorteos" element={<MisSorteos />} />

        <Route path="/sorteos/:id" element={<DetallesSorteo />} />
        {/* <Route path="/editar/:id" element={<EditarSorteo />} /> */}

      </Routes>
    </MainLayout>
  )
}

export default App;
