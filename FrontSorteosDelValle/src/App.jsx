import React from 'react';
import Header from './components/header.jsx';
import CrearSorteo from './GestionSorteo/crearSorteo.jsx';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark">
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