
import React from 'react';
import { Page } from '../types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-white/5 bg-card-dark py-16 px-6 md:px-20 lg:px-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="size-12 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-white text-lg font-extrabold uppercase tracking-tight">Jhuly Martins</h2>
          </div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">
            © 2024 Jhuly Martins - Sobrancelha Designer. Todos os direitos reservados.
          </p>
        </div>

        <div className="flex gap-10 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
          <a className="hover:text-primary transition-colors" href="#">Termos</a>
          <a className="hover:text-primary transition-colors" href="#">Privacidade</a>
          <a className="hover:text-primary transition-colors" href="#">Suporte</a>
        </div>

        <div className="flex gap-6">
          <button onClick={() => onNavigate(Page.ADMIN)} className="size-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary transition-all" title="Área Administrativa">
            <span className="material-symbols-outlined text-xl">lock</span>
          </button>
          <a href="#" className="size-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary transition-all">
            <span className="material-symbols-outlined text-xl">public</span>
          </a>
          <a href="#" className="size-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary transition-all">
            <span className="material-symbols-outlined text-xl">camera_enhance</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
