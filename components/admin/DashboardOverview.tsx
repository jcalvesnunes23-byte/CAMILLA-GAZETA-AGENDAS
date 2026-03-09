import React from 'react';
import { useStudio } from '../../context/StudioContext';

const DashboardOverview: React.FC = () => {
    const { bookings } = useStudio();

    // Metrics Logic
    const validBookings = bookings.filter(b => b.status !== 'cancelled');
    const totalRevenue = validBookings.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalAppointments = validBookings.length;

    // Today's Date Logic
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    const todayBookings = validBookings.filter(b => b.date === todayISO);

    return (
        <div className="flex flex-col gap-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card-dark p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl">calendar_month</span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Agendamentos Totais</p>
                    <h3 className="text-3xl font-black text-white">{totalAppointments}</h3>
                </div>

                <div className="bg-card-dark p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl">payments</span>
                    </div>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Receita Estimada</p>
                    <h3 className="text-3xl font-black text-white">R$ {totalRevenue.toFixed(2)}</h3>
                </div>

                <div className="bg-card-dark p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl">today</span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Hoje</p>
                    <h3 className="text-3xl font-black text-white">{todayBookings.length} <span className="text-sm font-medium text-slate-500">clientes</span></h3>
                </div>
            </div>

            {/* Recent Activity / Visual Placeholder */}
            <div className="bg-card-dark rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">Últimos Agendamentos</h3>
                </div>
                <div className="p-6">
                    {validBookings.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-sm">
                            Nenhum agendamento registrado ainda.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-white/5 text-xs uppercase font-bold text-white">
                                    <tr>
                                        <th className="p-4 rounded-l-lg">Cliente</th>
                                        <th className="p-4">Serviço</th>
                                        <th className="p-4">Data/Hora</th>
                                        <th className="p-4">Pagamento</th>
                                        <th className="p-4 rounded-r-lg">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {validBookings.slice(-5).reverse().map((booking, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-bold text-white">{booking.customerName}</td>
                                            <td className="p-4">{booking.serviceId}</td>
                                            <td className="p-4">{booking.date} às {booking.time}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${booking.paymentOption === 'full' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                    {booking.paymentOption === 'deposit' ? 'Sinal 20%' : 'Integral'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-white">R$ {booking.totalAmount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
