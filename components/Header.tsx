
import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  onNavigate: (page: Page, elementId?: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    onNavigate(Page.LANDING, sectionId);
  };

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate(Page.LANDING)}
        >
          <div className="size-14 flex items-center justify-center transition-transform group-hover:scale-110">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight uppercase text-white">
            Jhuly Martins <span className="text-primary">Designer</span>
          </h2>
        </div>



        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate(Page.CHECKOUT)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            Agendar Agora
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
