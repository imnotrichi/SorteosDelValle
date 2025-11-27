import React, { use, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"; // 1. Importa los componentes de rutas
import "./index.css";
import Header from "./components/header.jsx";
import PaginaNoEncontrada from "./components/paginaNoEncontrada.jsx";
import CrearSorteo from "./gestionSorteo/crearSorteo.jsx";
import MisSorteos from "./gestionSorteo/misSorteos.jsx";
import DetallesSorteo from "./gestionSorteo/detallesSorteo.jsx";
import Inicio from "./gestionSorteoCliente/inicio.jsx";
import DetalleSorteo from "./gestionSorteoCliente/detalleSorteo.jsx";
import NumerosSorteo from "./gestionSorteoCliente/numerosSorteo.jsx";
import EditarSorteo from "./gestionSorteo/editarSorteo.jsx"
import LiberarNumeros from "./gestionSorteo/liberarNumeros.jsx";
import RegistrarUsuario from "./registrarUsuario/registrarUsuario.jsx";
import IniciarSesion from "./registrarUsuario/iniciarSesion.jsx";

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
      <Route path="/iniciar-sesion" element={<IniciarSesion />} />
      <Route path="/registrar-usuario" element={<RegistrarUsuario/>} />
      <Route path="/sorteo/:id" element={<DetalleSorteo />} />
      <Route path="/sorteo/:id/numeros" element={<NumerosSorteo />} />

      <Route path="/admin" element={<MainLayout><MisSorteos/></MainLayout>} />
      <Route 
        path="/admin/crearSorteo" 
        element={<MainLayout><CrearSorteo currentUserEmail={currentUser.email}/></MainLayout>} 
      />
      <Route path="/admin/misSorteos" element={<MainLayout><MisSorteos /></MainLayout>} />
      <Route path="/admin/sorteos/:idSorteo" element={<MainLayout><DetallesSorteo/></MainLayout>} />
      <Route path="/admin/editar/:id" element={<MainLayout><EditarSorteo /></MainLayout>} />
      <Route path="/admin/sorteo/boletos/:id" element={<MainLayout><LiberarNumeros /></MainLayout>} />

      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  )
}

export default App;
