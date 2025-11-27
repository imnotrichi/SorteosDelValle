import React from 'react';
import logo from '../assets/logo.png';
import userIcon from '../assets/usuario.png';

const HeaderCliente = ({ onNavigate}) => {
  return (
    <header className="sticky top-0 z-20 w-full bg-background-light/80 backdrop-blur-sm border-b border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4 text-text-light">
            <button onClick={() => onNavigate('/iniciar-sesion')} className="cursor-pointer">
              <img src={logo} alt="Sorteos del Valle" className="h-35 w-auto" />
            </button>
          </div>

          <div className="flex flex-1 justify-end gap-2 items-center">
            <nav className="hidden md:flex items-center gap-9 mr-7">
              <button 
                onClick={() => onNavigate('/iniciar-sesion')} 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Iniciar Sesions
              </button>

              <button 
                onClick={() => onNavigate('/registrar-usuario')}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Registrarse
              </button>
            </nav>

          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderCliente;