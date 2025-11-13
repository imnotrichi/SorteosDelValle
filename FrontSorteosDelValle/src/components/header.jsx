import React from 'react';
import logo from '../assets/logo.png';
import userIcon from '../assets/usuario.png';

const Header = ({onNavigate}) => {
  return (
    <header className="sticky top-0 z-20 w-full bg-background-light/80 backdrop-blur-sm border-b border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4 text-text-light dark:text-text-dark">
            <button onClick={() => onNavigate('/')} className="cursor-pointer">
              <img src={logo} alt="Sorteos del Valle" className="h-35 w-auto" />
            </button>
          </div>
          <div className="flex flex-1 justify-end gap-2 items-center">
            <nav className="hidden md:flex items-center gap-9 mr-7">
                <button onClick={() => onNavigate('/')} className="text-sm font-medium hover:text-primary">
                  Mis Sorteos
                </button>

                <button 
                onClick={()=> onNavigate("/reportes")}
                //TODO: onClick={() => onNavigate('reportes')} // <-- Futuro
                className="text-sm font-medium hover:text-primary">
                Reportes
                </button>
            </nav>
            <button onClick={() => onNavigate('/crear-sorteo')} className="hidden sm:flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-primary/90 text-text-light text-sm font-bold">
              Crear sorteo
            </button>
            <div className="flex items-center gap-2 pl-4">
              <img src={userIcon} alt="Usuario" className="w-6 h-6" />
              <span className="text-sm font-medium">Victoria</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;