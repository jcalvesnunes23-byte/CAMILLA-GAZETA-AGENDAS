
import React, { useState } from 'react';
import { BookingState, Service } from '../types';
import { TIME_SLOTS } from '../constants';
import { useStudio } from '../context/StudioContext';
import { supabase } from '../lib/supabaseClient';

interface CheckoutPageProps {
  bookingState: BookingState;
  setBookingState: React.Dispatch<React.SetStateAction<BookingState>>;
  onBack: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ bookingState, setBookingState, onBack }) => {
  const { services, availability, addBooking, bookedSlots = [], loading } = useStudio();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (loading || services.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Carregando serviços luxo...</p>
      </div>
    );
  }

  const selectedService = services.find(s => s.id === bookingState.serviceId) || services[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingState(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirm = async () => {
    try {
      if (!isPolicyAccepted) return;
      setIsSubmitting(true);

      // Calculate amounts
      const addonsTotal = (bookingState.selectedAddons || []).reduce((sum, addon) => sum + addon.price, 0);
      const totalAmount = selectedService.price + addonsTotal;

      // Create appointment in Supabase
      const newBooking = {
        ...bookingState,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
        totalAmount
      };

      const createdBooking = await addBooking(newBooking);
      const appointmentId = createdBooking?.id || newBooking.id;

      // 1. Call AbacatePay Edge Function
      let checkoutUrl = '';
      try {
        console.log('Calling Edge Function: create-abacate-billing', { amount: totalAmount, appointmentId });
        const { data: billingData, error: billingError } = await supabase.functions.invoke('create-abacate-billing', {
          body: {
            amount: totalAmount,
            appointmentId: appointmentId,
            customer: {
              name: bookingState.customerName,
              email: bookingState.customerEmail,
              cellphone: bookingState.customerPhone,
              taxId: bookingState.customerCPF
            },
            successUrl: `${window.location.origin}/?success=true&id=${appointmentId}`
          }
        });

        if (billingError) {
          console.error('Edge Function Error:', billingError);
          // Tenta extrair a mensagem de erro do corpo da resposta se disponível
          let detailedError = billingError.message;
          if (billingData && typeof billingData === 'object' && 'error' in billingData) {
            detailedError = (billingData as any).error;
          }
          throw new Error(detailedError || 'Erro na função de pagamento');
        }

        if (billingData?.url) {
          checkoutUrl = billingData.url;
          console.log('Checkout URL generated:', checkoutUrl);
        } else {
          throw new Error('AbacatePay não retornou link de pagamento.');
        }
      } catch (err: any) {
        console.error('Error creating AbacatePay billing:', err);
        alert(`Aviso: Não foi possível gerar o link de pagamento PIX. Detalhe: ${err.message}. Vamos prosseguir com o agendamento via WhatsApp.`);
      }

      // Format WhatsApp Message
      const dateFormatted = new Date(bookingState.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' });
      const addonsList = (bookingState.selectedAddons || []).map(a => a.name).join(', ') || 'Nenhum';

      const message = `Olá! Realizei um novo agendamento:

👤 *Cliente:* ${bookingState.customerName}
📞 *WhatsApp:* ${bookingState.customerPhone}
✨ *Serviço:* ${selectedService.name}
📅 *Data:* ${dateFormatted}
⏰ *Horário:* ${bookingState.time}
➕ *Adicionais:* ${addonsList}
💰 *Valor Total:* R$ ${totalAmount},00

${checkoutUrl ? `💳 *Link para Pagamento (PIX):* ${checkoutUrl}\n` : ''}
*ID do Agendamento:* ${appointmentId}

Aguardo a confirmação!`;

      const whatsappNumber = '5527997421646';
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

      // 2. Open AbacatePay Checkout if available, otherwise WhatsApp
      if (checkoutUrl) {
        // Use window.location.assign to avoid popup blockers
        window.location.assign(checkoutUrl);
      } else {
        window.open(whatsappUrl, '_blank');
      }

      setIsSuccess(true);
      setIsSubmitting(false);

    } catch (error: any) {
      console.error('Error creating booking:', error);
      const errorMessage = error.message || error.details || JSON.stringify(error);
      alert(`Erro ao criar agendamento: ${errorMessage}`);
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-12 text-center animate-in fade-in zoom-in duration-700">
        <div className="mb-8 animate-bounce transition-all">
          <img
            src="/logo.png"
            alt="Camilla Gazeta Logo"
            className="h-24 md:h-40 w-auto object-contain drop-shadow-2xl mx-auto"
          />
        </div>

        <h1 className="text-3xl md:text-5xl font-black italic text-white mb-4 uppercase tracking-tighter">
          Obrigado, <span className="text-primary">{bookingState.customerName}</span>!
        </h1>

        <p className="text-slate-400 text-base md:text-xl max-w-2xl mb-12 font-medium">
          Seu agendamento para <span className="text-white font-bold">{selectedService.name}</span> foi enviado com sucesso. Já estamos te aguardando no WhatsApp para os detalhes finais!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-12">
          <div className="bg-card-dark p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-primary">calendar_month</span>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Data</span>
            <span className="text-white font-bold">{new Date(bookingState.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span>
          </div>
          <div className="bg-card-dark p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Horário</span>
            <span className="text-white font-bold">{bookingState.time}</span>
          </div>
          <div className="bg-card-dark p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-primary">payments</span>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total</span>
            <span className="text-white font-bold">R$ {selectedService.price + (bookingState.selectedAddons || []).reduce((sum, a) => sum + a.price, 0)},00</span>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="bg-white hover:bg-white/90 text-black font-black py-4 px-12 rounded-full border border-white/10 transition-all uppercase tracking-tighter text-sm shadow-xl shadow-white/10"
        >
          Voltar para o Início
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 py-24 px-6 md:px-20 lg:px-40">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider w-fit mb-4"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Voltar
          </button>
          <h2 className="text-white text-4xl lg:text-5xl font-black leading-tight tracking-tighter">
            Agendamento & Checkout <span className="text-primary italic">Luxo</span>
          </h2>
          <p className="text-slate-400 text-lg font-light max-w-2xl">
            Garanta seu momento de exclusividade com os melhores procedimentos de nail design.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Step 1: Date & Time */}
            <section className="bg-card-dark rounded-2xl border border-border-dark p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <span className="bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center font-black text-lg">1</span>
                <h3 className="text-white text-2xl font-black">Escolha a Data e Horário</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <button className="text-white hover:bg-primary/20 rounded-full p-2 transition-colors">
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <p className="text-white font-black uppercase tracking-[0.2em] text-sm">
                      {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                    <button className="text-white hover:bg-primary/20 rounded-full p-2 transition-colors">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-7 text-center text-slate-500 font-black text-[10px] uppercase mb-2">
                    <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SAB</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

                      // Calculate the 7-day rolling window
                      const availableDates = [];
                      let checkDate = new Date(today);
                      checkDate.setDate(today.getDate() + 1); // Start strictly from tomorrow

                      while (availableDates.length < 7) {
                        const dateStr = checkDate.toISOString().split('T')[0];
                        const isSunday = checkDate.getDay() === 0;
                        const dayData = availability[dateStr];

                        // Filter slots that are already booked
                        const availableSlots = (dayData?.slots || []).filter(time => {
                          const isBooked = bookedSlots.some(booking =>
                            booking.date === dateStr &&
                            booking.time === time &&
                            booking.status !== 'cancelled'
                          );
                          return !isBooked;
                        });

                        if (!isSunday && dayData?.available && availableSlots.length > 0) {
                          availableDates.push(dateStr);
                        }

                        checkDate.setDate(checkDate.getDate() + 1);
                        // Prevent infinite loop if no dates are available
                        if (checkDate.getTime() > today.getTime() + 1000 * 60 * 60 * 24 * 60) break;
                      }

                      const availableDatesSet = new Set(availableDates);

                      return (
                        <>
                          {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-10"></div>
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const d = new Date(today.getFullYear(), today.getMonth(), day);
                            const dateStr = d.toISOString().split('T')[0];
                            const isUnlockable = availableDatesSet.has(dateStr);
                            const isSelected = bookingState.date === dateStr && isUnlockable;

                            return (
                              <button
                                key={day}
                                disabled={!isUnlockable}
                                onClick={() => setBookingState(p => ({ ...p, date: dateStr, time: '' }))}
                                className={`h-10 rounded-lg text-sm font-bold transition-all flex items-center justify-center
                                  ${isSelected
                                    ? 'bg-primary text-white shadow-xl shadow-primary/30'
                                    : isUnlockable
                                      ? 'text-white hover:bg-border-dark cursor-pointer'
                                      : 'text-slate-700 cursor-not-allowed opacity-30 shadow-inner'
                                  }
                                `}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {bookingState.date ? (
                    <>
                      <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-sm font-black">event</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          {new Date(bookingState.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' })}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
                        {(availability[bookingState.date]?.slots || [])
                          .filter(time => !bookedSlots.some(b =>
                            b.date === bookingState.date &&
                            b.time === time &&
                            b.status !== 'cancelled'
                          ))
                          .map((time) => (
                            <button
                              key={time}
                              onClick={() => setBookingState(p => ({ ...p, time }))}
                              className={`border py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                              ${bookingState.time === time
                                  ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30'
                                  : 'border-border-dark bg-background-dark/50 text-slate-400 hover:border-primary/50'
                                }
                            `}
                            >
                              {time}
                            </button>
                          ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-2xl">
                      <span className="material-symbols-outlined text-4xl text-slate-700 mb-2">touch_app</span>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Selecione uma data para ver os horários</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Step 1.5: Add-ons (Optional) */}
            {selectedService.addons && selectedService.addons.length > 0 && (
              <section className="bg-card-dark rounded-2xl border border-border-dark p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <span className="bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center font-black text-lg">1.5</span>
                  <h3 className="text-white text-2xl font-black">Turbine seu Procedimento</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {selectedService.addons.filter(addon => addon.active !== false).map((addon, index) => {
                    const isSelected = (bookingState.selectedAddons || []).some(a => a.name === addon.name);
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setBookingState(prev => {
                            const currentAddons = prev.selectedAddons || [];
                            const exists = currentAddons.some(a => a.name === addon.name);
                            let newAddons;
                            if (exists) {
                              newAddons = currentAddons.filter(a => a.name !== addon.name);
                            } else {
                              newAddons = [...currentAddons, { name: addon.name, price: addon.price }];
                            }
                            return { ...prev, selectedAddons: newAddons };
                          });
                        }}
                        className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all group
                          ${isSelected
                            ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                            : 'bg-background-dark/50 border-border-dark hover:border-primary/30'
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`size-6 rounded border flex items-center justify-center transition-colors
                            ${isSelected ? 'bg-primary border-primary' : 'border-slate-500 bg-transparent'}
                          `}>
                            {isSelected && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
                          </div>
                          <span className={`font-bold text-sm uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            {addon.name}
                          </span>
                        </div>
                        <span className={`font-black text-sm ${isSelected ? 'text-primary' : 'text-slate-500'}`}>
                          + R$ {addon.price},00
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Step 2: Customer Data */}
            <section className="bg-card-dark rounded-2xl border border-border-dark p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <span className="bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center font-black text-lg">2</span>
                <h3 className="text-white text-2xl font-black">Seus Dados</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-slate-400 text-[10px] font-black uppercase px-1 tracking-[0.1em]">Nome Completo</label>
                  <input
                    name="customerName"
                    value={bookingState.customerName}
                    onChange={handleInputChange}
                    className="bg-background-dark border border-border-dark rounded-xl px-5 py-4 text-white focus:border-primary focus:ring-0 transition-all text-sm font-medium"
                    placeholder="Ex: Ana Silva"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-slate-400 text-[10px] font-black uppercase px-1 tracking-[0.1em]">WhatsApp</label>
                  <input
                    name="customerPhone"
                    value={bookingState.customerPhone}
                    onChange={handleInputChange}
                    className="bg-background-dark border border-border-dark rounded-xl px-5 py-4 text-white focus:border-primary focus:ring-0 transition-all text-sm font-medium"
                    placeholder="(00) 00000-0000"
                    type="tel"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-slate-400 text-[10px] font-black uppercase px-1 tracking-[0.1em]">CPF</label>
                  <input
                    name="customerCPF"
                    value={bookingState.customerCPF}
                    onChange={handleInputChange}
                    className="bg-background-dark border border-border-dark rounded-xl px-5 py-4 text-white focus:border-primary focus:ring-0 transition-all text-sm font-medium"
                    placeholder="000.000.000-00"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-slate-400 text-[10px] font-black uppercase px-1 tracking-[0.1em]">E-mail para Confirmação</label>
                  <input
                    name="customerEmail"
                    value={bookingState.customerEmail}
                    onChange={handleInputChange}
                    className="bg-background-dark border border-border-dark rounded-xl px-5 py-4 text-white focus:border-primary focus:ring-0 transition-all text-sm font-medium"
                    placeholder="seuemail@exemplo.com"
                    type="email"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Step 3: Confirmation */}
            <section className="bg-card-dark rounded-2xl border border-border-dark p-8 shadow-2xl mb-12">
              <div className="flex items-center gap-3 mb-8">
                <span className="bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center font-black text-lg">3</span>
                <h3 className="text-white text-2xl font-black">Confirmação de Agendamento</h3>
              </div>

              <div className="bg-background-dark/50 border border-border-dark rounded-xl p-8 flex flex-col items-center text-center gap-6">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-3xl">payments</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">Pagamento via PIX (AbacatePay)</h4>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                    Ao clicar abaixo, você será redirecionada para o checkout seguro do <span className="text-white font-bold">AbacatePay</span> para realizar o pagamento via PIX. Após isso, seu horário será confirmado automaticamente.
                  </p>
                </div>
              </div>


              <div className="mt-12 flex flex-col gap-6">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors group">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={isPolicyAccepted}
                      onChange={(e) => setIsPolicyAccepted(e.target.checked)}
                    />
                    <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center peer-checked:bg-primary peer-checked:text-white transition-all text-transparent">
                      <span className="material-symbols-outlined text-sm font-black">check</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                      Ao clicar em finalizar, você será direcionada para o pagamento. O horário será reservado e a confirmação final será enviada também via WhatsApp.
                    </p>
                    <p className="text-primary text-[10px] font-black uppercase tracking-wider">
                      PAGAMENTO SEGURO VIA ABACATEPAY.
                    </p>
                  </div>
                </label>

                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting || !isPolicyAccepted}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-xl shadow-2xl shadow-primary/30 transition-all transform hover:scale-[1.01] active:scale-[0.98] uppercase tracking-tighter text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <span>Finalizar Agendamento</span>
                      <span className="material-symbols-outlined">send</span>
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 glass rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
              <div className="relative h-56 overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={selectedService.image}
                  alt={selectedService.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card-dark to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="bg-primary text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full mb-2 inline-block shadow-lg">Sua Escolha</span>
                  <h4 className="text-white text-2xl font-black">{selectedService.name}</h4>
                </div>
              </div>

              <div className="p-8 flex flex-col gap-8">
                <div className="flex flex-col gap-5 border-b border-border-dark pb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Data</span>
                    <span className="text-white font-black text-sm">
                      {bookingState.date ? new Date(bookingState.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Horário</span>
                    <span className="text-white font-black text-sm">{bookingState.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Profissional</span>
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px] text-primary font-black">person</span>
                      </div>
                      <span className="text-white font-black text-sm">Camilla Gazeta</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Base Service Price */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">
                      {selectedService.name} Luxo
                    </span>
                    <span className="text-white font-black">
                      R$ {selectedService.price},00
                    </span>
                  </div>

                  {/* Selected Add-ons */}
                  {(bookingState.selectedAddons || []).map((addon, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs text-primary">add</span>
                        {addon.name}
                      </span>
                      <span className="text-white font-black">
                        R$ {addon.price},00
                      </span>
                    </div>
                  ))}

                  {/* Dynamic Totals */}
                  {(() => {
                    const addonsTotal = (bookingState.selectedAddons || []).reduce((sum, a) => sum + a.price, 0);
                    const grandTotal = selectedService.price + addonsTotal;
                    const depositValue = grandTotal * 0.2;

                    return (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-medium">Taxa de Reserva Online</span>
                          <span className="text-accent-green font-black uppercase text-[10px] tracking-widest">Grátis</span>
                        </div>

                        <div className="flex justify-between items-center pt-5 mt-2 border-t border-border-dark">
                          <div className="flex flex-col">
                            <span className="text-white font-black uppercase text-xs tracking-[0.2em]">
                              Total Geral
                            </span>
                            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-1">
                              Pagar no Atendimento
                            </span>
                          </div>
                          <span className="text-3xl font-black text-white">
                            R$ {grandTotal},00
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
