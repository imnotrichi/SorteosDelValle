import React, { use, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"; // 1. Importa los componentes de rutas
import "./index.css";
import Header from "./components/header.jsx";
import CrearSorteo from "./gestionSorteo/crearSorteo.jsx";
import MisSorteos from "./gestionSorteo/misSorteos.jsx";
import DetallesSorteo from "./gestionSorteo/detallesSorteo.jsx";
import Inicio from "./gestionSorteoCliente/inicio.jsx";
import DetalleSorteo from "./gestionSorteoCliente/detalleSorteo.jsx";
import NumerosSorteo from "./gestionSorteoCliente/numerosSorteo.jsx";
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
      <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/sorteo/:id" element={<DetalleSorteo />} />
      <Route path="/sorteo/:id/numeros" element={<NumerosSorteo />} />
      <Route path="/admin" element={<MainLayout><MisSorteos/></MainLayout>} />
      <Route 
        path="/crearSorteo" 
        element={<MainLayout><CrearSorteo currentUserEmail={currentUser.email}/></MainLayout>} 
      />
      <Route path="/admin/misSorteos" element={<MainLayout><MisSorteos /></MainLayout>} />
      <Route path="/sorteos/1" element={<MainLayout><DetallesSorteo/></MainLayout>} />
      {/* <Route path="/admin/editar/:id" element={<MainLayout><EditarSorteo /></MainLayout>} /> */}
    </Routes>
  )
}

export default App;
