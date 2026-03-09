
import React from 'react';
import { useStudio } from '../context/StudioContext';

interface LandingPageProps {
  onSelectService: (id: string) => void;
  onBookNow: () => void;
  onScrollToSection: (id: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectService, onBookNow, onScrollToSection }) => {
  const { services, loading } = useStudio();
  const showSkeleton = loading && services.length === 0;

  return (
    <div className="animate-in fade-in duration-700">
      {/* ... Hero Section remains same ... */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden px-6 lg:px-20 pt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
              </span>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Disponível Hoje</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white">
              Sobrancelhas perfeitas são o detalhe que realça o seu <span className="text-primary italic">olhar único.</span>
            </h1>


            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onBookNow}
                className="bg-primary hover:bg-primary/80 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Agendar Agora
                <span className="material-symbols-outlined">calendar_month</span>
              </button>
              <button
                onClick={() => onScrollToSection('services')}
                className="border border-white/10 bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all"
              >
                Ver serviços
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative group">
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all"></div>
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="/jhuly.png"
                alt="Jhuly Martins - Designer de Sobrancelha"
              />
              <div className="absolute bottom-6 left-6 bg-card-dark/95 backdrop-blur-sm border border-border-dark p-5 rounded-xl shadow-2xl hidden md:block max-w-[240px]">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green flex-shrink-0">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Artista Certificada</p>
                    <p className="text-white font-bold">Qualidade Premium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 bg-background-dark">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Nossa Especialidade</span>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">Nossos Serviços</h2>
            </div>
            <p className="text-slate-400 max-w-md text-sm md:text-base">
              Realce sua beleza com técnicas personalizadas de design de sobrancelha e micropigmentação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {showSkeleton ? (
              // Skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-card-dark rounded-2xl border border-white/5 p-3 flex flex-col gap-6">
                  <div className="w-full aspect-square rounded-xl bg-white/5"></div>
                  <div className="px-4 space-y-4 pb-6">
                    <div className="h-6 w-3/4 bg-white/5 rounded-lg"></div>
                    <div className="h-4 w-full bg-white/5 rounded-lg"></div>
                    <div className="h-12 w-full bg-white/5 rounded-xl"></div>
                  </div>
                </div>
              ))
            ) : (
              services.map((service) => (
                <div
                  key={service.id}
                  className={`group relative flex flex-col bg-card-dark rounded-2xl border transition-all p-3 hover:shadow-2xl hover:shadow-primary/10 ${service.popular ? 'border-primary/50 ring-1 ring-primary/20' : 'border-white/5 hover:border-primary/30'}`}
                >
                  {service.popular && (
                    <div className="absolute top-6 right-6 z-10">
                      <span className="bg-primary text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg">Mais Procurado</span>
                    </div>
                  )}
                  <div className="w-full aspect-square rounded-xl overflow-hidden mb-6">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="px-4 pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{service.name}</h3>
                      <span className="text-primary font-black">R$ {service.price},00</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                      {service.description}
                    </p>
                    <button
                      onClick={() => onSelectService(service.id)}
                      className={`w-full py-4 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${service.popular ? 'bg-primary hover:bg-primary/90' : 'bg-white/5 hover:bg-primary'}`}
                    >
                      Agendar Agora
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Map/Studio Experience */}
      <section id="contact" className="py-24 px-6 bg-[#0c0c16] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <div>
                <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Experiência Exclusiva</span>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Visite nosso <span className="italic">Studio</span></h2>
                <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-lg">
                  Localizado em um dos pontos mais sofisticados da cidade, nosso espaço foi projetado para oferecer o máximo conforto e luxo durante seu atendimento.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">Endereço</h4>
                    <p className="text-slate-400 leading-relaxed">Centro Empresarial do shopping Moxuara - Torre B 803</p>
                  </div>
                </div>
              </div>
            </div>


            <div className="relative flex justify-center items-center">
              <div className="absolute -inset-20 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
              <div className="relative w-full aspect-square max-w-[500px]">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Shopping+Moxuara+-+Sala+803+Torre+4B+-+Bloco+10+-+São+Francisco,+Cariacica+-+ES,+29140-000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                  title="Ver no Google Maps"
                >
                  <div className="w-full h-full rounded-full border-2 border-primary/30 overflow-hidden relative group">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: "url('/studio.png?v=2')" }}
                    ></div>
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                  </div>
                </a>

                <div className="absolute -right-2 md:-right-4 top-1/4 bg-card-dark border border-border-dark p-2 md:p-3 rounded-lg shadow-2xl flex items-center gap-2 md:gap-3 animate-bounce z-10">
                  <div className="size-8 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green">
                    <span className="material-symbols-outlined text-sm">map</span>
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">Google Maps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >
    </div >
  );
};

export default LandingPage;
