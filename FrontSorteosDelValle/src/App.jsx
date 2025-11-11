import React from 'react';
import './index.css';
import Header from './components/header.jsx';
import CrearSorteo from './gestionSorteo/crearSorteo.jsx';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background-light font-display text-text-light">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <MainLayout>
      <CrearSorteo />
    </MainLayout>
  );
}

export default App;