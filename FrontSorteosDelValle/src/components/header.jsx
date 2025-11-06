import React from 'react';

const Logo = () => (
  <svg fill="none" viewBox="0 0 48 48" className="size-6 text-primary">
  </svg>
);

const Header = () => {
  return (
    <header className="sticky top-0 z-20 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 text-text-light dark:text-text-dark">
            <Logo />
            <h2 className="text-text-light dark:text-text-dark text-lg font-bold">
              Sorteos del Valle
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-2 items-center">
            <nav className="hidden md:flex items-center gap-9 mr-7">
              <a href="#" className="text-sm font-medium hover:text-primary">Mis Sorteos</a>
              <a href="#" className="text-sm font-medium hover:text-primary">Reportes</a>
            </nav>
            <button className="hidden sm:flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-text-light text-sm font-bold">
              Crear sorteo
            </button>
            <div className="flex items-center gap-2 pl-4">
              <span className="material-symbols-outlined">account_circle</span>
              <span className="text-sm font-medium">Victoria</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;