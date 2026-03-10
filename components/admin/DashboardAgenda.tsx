import React from 'react';
import { useStudio } from '../../context/StudioContext';

const DashboardAgenda: React.FC = () => {
    const { bookings, updateBookingStatus, deleteBooking, services } = useStudio();

    // Filter bookings for the next 7 days (including today)
    const filteredBookings = bookings.filter(booking => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingDate = new Date(booking.date + 'T00:00:00');

        return bookingDate >= today;
    });

    const sortedBookings = [...filteredBookings].sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="text-white font-bold uppercase tracking-wide">Agenda de Atendimentos</h3>
                    <p className="text-slate-500 text-xs mt-1">Todos os próximos agendamentos</p>
                </div>
            </div>

            <div className="bg-card-dark rounded-xl border border-white/5 overflow-hidden">
                {sortedBookings.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                        <p>Nenhum agendamento futuro encontrado.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-white/5 text-xs uppercase font-bold text-white">
                                <tr>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Data/Hora</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Serviço</th>
                                    <th className="p-4">Pagamento</th>
                                    <th className="p-4">Contato</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedBookings.map((booking) => {
                                    const service = services.find(s => s.id === booking.serviceId);
                                    return (
                                        <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase w-fit
                                ${booking.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400' :
                                                            booking.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                                'bg-red-500/10 text-red-400'
                                                        }
                              `}>
                                                        {booking.status === 'confirmed' ? 'Confirmado' :
                                                            booking.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                                    </span>
                                                    {booking.isMaintenance && (
                                                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[8px] font-black uppercase w-fit">
                                                            Manutenção/Retorno
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-white">
                                                {new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} <br />
                                                <span className="text-slate-500 text-xs">{booking.time}</span>
                                            </td>
                                            <td className="p-4 font-bold">{booking.customerName}</td>
                                            <td className="p-4">{service?.name || booking.serviceId}</td>
                                            <td className="p-4">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${booking.paymentOption === 'deposit' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                    {booking.paymentOption === 'deposit' ? 'Sinal (20%)' : 'Valor Total'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs">
                                                {booking.customerPhone} <br />
                                                {booking.customerEmail}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                                                        <button
                                                            onClick={() => updateBookingStatus(booking.id, booking.status === 'pending' ? 'confirmed' : 'completed')}
                                                            className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                                                            title={booking.status === 'pending' ? "Confirmar Agendamento" : "Concluir Atendimento"}
                                                        >
                                                            <span className="material-symbols-outlined text-base">
                                                                {booking.status === 'pending' ? 'thumb_up' : 'check_circle'}
                                                            </span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Tem certeza que deseja excluir permanentemente este agendamento?')) {
                                                                deleteBooking(booking.id);
                                                            }
                                                        }}
                                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                        title="Excluir Agendamento"
                                                    >
                                                        <span className="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardAgenda;
