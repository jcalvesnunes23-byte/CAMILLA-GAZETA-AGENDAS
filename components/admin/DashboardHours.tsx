import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';

const DashboardHours: React.FC = () => {
    const { availability, toggleDayAvailability, updateDaySlots, bookings, addBooking } = useStudio();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [maintenanceSlot, setMaintenanceSlot] = useState<string | null>(null);
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');

    // Generate hours from 09:00 to 22:00
    const allHours = Array.from({ length: 14 }, (_, i) => {
        const h = i + 9;
        return `${h.toString().padStart(2, '0')}:00`;
    });

    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const formatDateStr = (day: number) => {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return d.toISOString().split('T')[0];
    };

    const handleDayClick = (day: number) => {
        setSelectedDate(formatDateStr(day));
    };

    const toggleHour = (date: string, hour: string) => {
        const currentData = availability[date] || { available: false, slots: [] };
        let newSlots;
        if (currentData.slots.includes(hour)) {
            newSlots = currentData.slots.filter(s => s !== hour);
        } else {
            newSlots = [...currentData.slots, hour].sort();
        }
        updateDaySlots(date, newSlots);
    };

    const handleScheduleMaintenance = async () => {
        if (!selectedDate || !maintenanceSlot || !clientName) return;

        try {
            const maintenanceBooking = {
                id: crypto.randomUUID(),
                serviceId: 'maintenance', // Special ID for maintenance
                date: selectedDate,
                time: maintenanceSlot,
                customerName: clientName,
                customerPhone: clientPhone,
                customerEmail: '',
                paymentOption: 'full' as const,
                createdAt: new Date().toISOString(),
                status: 'confirmed' as const,
                totalAmount: 0,
                depositAmount: 0,
                isMaintenance: true
            };

            await addBooking(maintenanceBooking);

            // Auto open the slot if it's not open, so it can be "booked"
            const currentData = availability[selectedDate] || { available: true, slots: [] };
            if (!currentData.slots.includes(maintenanceSlot)) {
                const newSlots = [...currentData.slots, maintenanceSlot].sort();
                await updateDaySlots(selectedDate, newSlots);
            }

            setIsMaintenanceModalOpen(false);
            setClientName('');
            setClientPhone('');
            setMaintenanceSlot(null);
            alert('Manutenção/Retorno agendado com sucesso!');
        } catch (error) {
            console.error('Error scheduling maintenance:', error);
            alert('Erro ao agendar manutenção.');
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card-dark p-4 sm:p-6 rounded-2xl border border-white/5">
                <div className="text-center sm:text-left">
                    <h3 className="text-white font-bold uppercase tracking-tight text-sm sm:text-base">Gerenciar Horários</h3>
                    <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">Configure dias de atendimento e horários</p>
                </div>
                <div className="flex items-center gap-1 sm:gap-4 bg-background-dark p-1.5 rounded-xl border border-white/5 w-full sm:w-auto justify-between sm:justify-start">
                    <button onClick={goToPrevMonth} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 shrink-0">
                        <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <span className="text-white font-bold uppercase text-[10px] sm:text-sm min-w-[90px] sm:min-w-[120px] text-center">
                        {monthName} {year}
                    </span>
                    <button onClick={goToNextMonth} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 shrink-0">
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CALENDAR GRID */}
                <div className="lg:col-span-2 bg-card-dark rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/2">
                        <div className="grid grid-cols-7 text-center mb-2">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                                <span key={d} className="text-[10px] uppercase font-black text-slate-500">{d}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square opacity-0"></div>
                            ))}
                            {(() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const activeDates = [];
                                let checkDate = new Date(today);
                                checkDate.setDate(today.getDate() + 1);

                                while (activeDates.length < 7) {
                                    const dateStr = checkDate.toISOString().split('T')[0];
                                    const isSun = checkDate.getDay() === 0;
                                    // We consider it "active" if it's not Sunday and not yet filled
                                    if (!isSun) {
                                        activeDates.push(dateStr);
                                    }
                                    checkDate.setDate(checkDate.getDate() + 1);
                                    // Safety break
                                    if (checkDate.getTime() > today.getTime() + 1000 * 60 * 60 * 24 * 30) break;
                                }
                                const activeDatesSet = new Set(activeDates);

                                return Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = formatDateStr(day);
                                    const dayData = availability[dateStr];
                                    const isSelected = selectedDate === dateStr;
                                    const isSunday = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() === 0;
                                    const isOpen = dayData?.available && dayData.slots.length > 0;
                                    const isActiveWindow = activeDatesSet.has(dateStr);

                                    return (
                                        <button
                                            key={day}
                                            disabled={!isActiveWindow && !isSunday}
                                            onClick={() => handleDayClick(day)}
                                            className={`
                                                aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center gap-1 border transition-all text-xs sm:text-sm relative
                                                ${isSelected ? 'ring-2 ring-primary border-transparent' : 'border-white/5'}
                                                ${isActiveWindow ? 'ring-1 ring-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.15)] border-green-500/30' : ''}
                                                ${isSunday || !isActiveWindow ? 'opacity-30 grayscale-[0.5]' : ''}
                                                ${isOpen ? 'bg-primary/20 text-white' : 'bg-background-dark/50 text-slate-500'}
                                                ${!isActiveWindow ? 'cursor-not-allowed' : 'hover:border-primary/50'}
                                            `}
                                        >
                                            <span className="font-bold">{day}</span>
                                            {isOpen && (
                                                <span className="text-[8px] font-black uppercase text-primary">
                                                    {dayData.slots.length} h
                                                </span>
                                            )}
                                            {isOpen && (
                                                <div className="absolute top-1 right-1 flex gap-0.5">
                                                    {bookings.some(b => b.date === dateStr && b.isMaintenance && b.status !== 'cancelled') && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" title="Possui Manutenção"></div>
                                                    )}
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                        <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 sm:gap-4 px-2 py-3 sm:py-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/20 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]"></div>
                                <span className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400 tracking-wider">7 Dias Ativos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-400"></div>
                                <span className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400 tracking-wider">Disponíveis</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary"></div>
                                <span className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400 tracking-wider">Manutenção</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SLOTS PANEL */}
                <div className="bg-card-dark rounded-2xl border border-white/5 flex flex-col min-h-[500px]">
                    {selectedDate ? (
                        <>
                            <div className="p-6 border-b border-white/5">
                                <h4 className="text-white font-bold text-sm uppercase">
                                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h4>
                                <div className="mt-4 flex items-center justify-between">
                                    <button
                                        onClick={() => toggleDayAvailability(selectedDate)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all border ${availability[selectedDate]?.available
                                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                            : 'bg-green-500/10 border-green-500/30 text-green-400'
                                            }`}
                                    >
                                        {availability[selectedDate]?.available ? 'Fechar Dia' : 'Abrir Dia'}
                                    </button>
                                </div>
                            </div>
                            <div className="flex-grow p-6 overflow-y-auto">
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-4">Escolha os horários disponíveis:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {allHours.map(hour => {
                                        const isEnabled = availability[selectedDate]?.slots.includes(hour);
                                        const isDayOpen = availability[selectedDate]?.available;
                                        const booking = bookings.find(b =>
                                            b.date === selectedDate &&
                                            b.time === hour &&
                                            b.status !== 'cancelled'
                                        );
                                        const isBooked = !!booking;
                                        const isMaintenance = booking?.isMaintenance;

                                        return (
                                            <div key={hour} className="relative group">
                                                <button
                                                    disabled={!isDayOpen}
                                                    onClick={() => toggleHour(selectedDate, hour)}
                                                    className={`
                                                        w-full p-3 rounded-xl border text-xs font-bold transition-all relative
                                                        ${isEnabled
                                                            ? (isMaintenance ? 'bg-primary/20 border-primary text-primary' : 'bg-primary border-primary text-white shadow-lg shadow-primary/20')
                                                            : 'bg-white/5 border-white/10 text-slate-400'}
                                                        ${!isDayOpen ? 'opacity-20 cursor-not-allowed' : 'hover:border-primary/50'}
                                                        ${isMaintenance ? 'ring-1 ring-primary ring-inset' : ''}
                                                    `}
                                                >
                                                    {hour}
                                                    {isBooked && (
                                                        <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-card-dark shadow-lg ring-1 ${isMaintenance ? 'bg-primary ring-primary/50' : 'bg-red-500 ring-red-500/50'}`} title={isMaintenance ? "Manutenção Agendada" : "Horário já ocupado"}></div>
                                                    )}
                                                </button>
                                                {!isBooked && isEnabled && isDayOpen && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMaintenanceSlot(hour);
                                                            setIsMaintenanceModalOpen(true);
                                                        }}
                                                        className="absolute -top-1 -right-1 scale-0 group-hover:scale-100 bg-white text-primary rounded-full p-0.5 shadow-xl transition-transform"
                                                        title="Marcar Manutenção"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px] font-black">add</span>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-4 opacity-20">calendar_month</span>
                            <p className="text-sm">Selecione um dia no calendário para configurar os horários</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Maintenance Modal */}
            {isMaintenanceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-card-dark border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-white text-2xl font-black italic">Agendar <span className="text-primary">Manutenção</span></h4>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                                    {maintenanceSlot} • {new Date(selectedDate! + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                            <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-1">Nome da Cliente</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="Ex: Maria Oliveira"
                                    className="bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-0 transition-all text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-1">Telefone/WhatsApp</label>
                                <input
                                    type="tel"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-0 transition-all text-sm"
                                />
                            </div>

                            <button
                                onClick={handleScheduleMaintenance}
                                disabled={!clientName}
                                className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-xl shadow-xl shadow-primary/20 transition-all uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirmar Agendamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardHours;
