
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import CheckoutPage from './components/CheckoutPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { Page, BookingState } from './types';
import { SERVICES } from './constants';

import { StudioProvider } from './context/StudioContext';
import AdminLayout from './components/admin/AdminLayout'; // Will handle login internally or reroute

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [bookingState, setBookingState] = useState<BookingState>({
    serviceId: SERVICES[0].id,
    date: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })(),
    time: '09:00',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCPF: '',
    selectedAddons: []
  });

  const navigateTo = (page: Page, elementId?: string) => {
    setCurrentPage(page);
    // Se tivermos um ID de elemento, tentamos rolar para ele após um breve atraso para renderização
    if (elementId) {
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleServiceSelect = (id: string) => {
    setBookingState(prev => ({ ...prev, serviceId: id }));
    navigateTo(Page.CHECKOUT);
  };

  const renderContent = () => {
    switch (currentPage) {
      case Page.ADMIN:
        return <AdminLayout onNavigate={navigateTo} />;
      case Page.CHECKOUT:
        return (
          <CheckoutPage
            bookingState={bookingState}
            setBookingState={setBookingState}
            onBack={() => navigateTo(Page.LANDING)}
          />
        );
      case Page.LANDING:
      default:
        return (
          <LandingPage
            onSelectService={handleServiceSelect}
            onBookNow={() => navigateTo(Page.CHECKOUT)}
            onScrollToSection={(id) => navigateTo(Page.LANDING, id)}
          />
        );
    }
  };

  return (
    <StudioProvider>
      <div className="min-h-screen flex flex-col bg-background-dark font-display selection:bg-primary/30">
        {currentPage !== Page.ADMIN && <Header onNavigate={navigateTo} />}

        <main className="flex-grow">
          {renderContent()}
        </main>

        {currentPage !== Page.ADMIN && <Footer onNavigate={navigateTo} />}

        {/* Floating WhatsApp Button */}
        <a
          href="https://api.whatsapp.com/send?phone=5527997421646"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-[100] group flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 md:pl-5 md:pr-7 rounded-full shadow-2xl shadow-[#25D366]/40 transition-all hover:-translate-y-1"
        >
          <div className="flex items-center justify-center">
            <svg className="size-6 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.207L6.233 18.25l3.193-1.059c.905.539 1.812.894 2.923.896 3.181 0 5.765-2.586 5.767-5.766 0-3.18-2.585-5.765-5.767-5.765h.018zm4.335 8.165c-.19.533-1.077 1.025-1.48 1.075-.403.05-1.121.144-2.651-.433-1.53-.578-2.457-2.115-2.532-2.215-.075-.1-.611-.812-.611-1.55 0-.738.386-1.102.523-1.252.138-.15.3-.188.4-.188.1 0 .2 0 .288.01.1.01.225-.038.35.263.125.3.438 1.063.475 1.138.038.075.063.163.013.263-.05.1-.075.163-.15.25-.075.088-.163.188-.225.263-.075.075-.15.15-.063.3.088.15.388.638.825 1.025.563.5 1.038.65 1.2.725.163.075.263.063.363-.05.1-.113.425-.5.538-.675.113-.175.225-.15.375-.1.15.05 1 .475 1.175.563.175.088.288.125.325.2.038.075.038.438-.152.971zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.179L2 22l5.01-1.341C8.397 21.431 10.125 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.634 0-3.166-.489-4.453-1.325l-.32-.206-2.98.797.812-2.883-.227-.36A7.953 7.953 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"></path>
            </svg>
          </div>
          <span className="hidden md:block font-bold tracking-wide uppercase text-xs">Fale no WhatsApp</span>
        </a>
      </div>
    </StudioProvider>
  );
};

export default App;
