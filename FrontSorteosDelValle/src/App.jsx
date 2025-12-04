import React from "react";
import { Routes, Route, useNavigate, Navigate, Outlet } from "react-router-dom"; // 1. Importa los componentes de rutas
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
import { AuthProvider, useAuth } from "./registrarUsuario/AuthContext.jsx";
import SessionExpiredModal from "./components/sesionExpiradaModal.jsx"

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background-light font-display text-text-light">
      <Header onNavigate={navigate} />
      <main>{children}</main>
    </div>
  );
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.tipoUsuario)) {
    if (user.tipoUsuario === 'organizador') return <Navigate to="/admin/misSorteos" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

const PublicRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (user?.tipoUsuario === 'organizador') return <Navigate to="/admin/misSorteos" replace />;
    return <Navigate to="/" replace />
  }
  return <Outlet />;

}

function AppContent() {
  const { user, showSessionModal, closeSessionModal } = useAuth();

  return (
    <>
      <SessionExpiredModal isOpen={showSessionModal} onClose={closeSessionModal} />

      <Routes>
        {/* Rutas Públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/iniciar-sesion" element={<IniciarSesion />} />
          <Route path="/registrar-usuario" element={<RegistrarUsuario />} />
        </Route>

        {/* Rutas Públicas de cliente*/}
        <Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/sorteo/:id" element={<DetalleSorteo />} />
          <Route path="/sorteo/:id/numeros" element={<NumerosSorteo />} />
        </Route>

        {/* Rutas Públicas de organizador */}
        <Route element={<ProtectedRoute allowedRoles={['organizador']} />}>
          <Route path="/admin" element={<Navigate to="/admin/misSorteos" replace />} />
          <Route path="/admin/misSorteos" element={<MainLayout><MisSorteos /></MainLayout>} />
          <Route
            path="/admin/crearSorteo"
            element={<MainLayout><CrearSorteo currentUserEmail={user?.correo} /></MainLayout>}
          />
          <Route path="/admin/sorteos/:idSorteo" element={<MainLayout><DetallesSorteo /></MainLayout>} />
          <Route path="/admin/editar/:id" element={<MainLayout><EditarSorteo /></MainLayout>} />
          <Route path="/admin/sorteo/numeros/:id" element={<MainLayout><LiberarNumeros /></MainLayout>} />
        </Route>

        <Route path="*" element={<PaginaNoEncontrada />} />
      </Routes >


    </>
  );
}



function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
