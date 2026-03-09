import React from 'react';
import { useStudio } from '../../context/StudioContext';

const DashboardFinance: React.FC = () => {
    const { bookings } = useStudio();
    const validBookings = bookings.filter(b => b.status !== 'cancelled');

    // Calculations
    const totalRevenue = validBookings.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalReceived = validBookings.reduce((acc, curr) => {
        // If full payment, we received totalAmount. If deposit, we received depositAmount.
        // However, if status is 'completed' and was deposit, we assume they paid the rest locally.
        if (curr.status === 'completed') return acc + curr.totalAmount;
        if (curr.paymentOption === 'deposit') return acc + curr.depositAmount;
        return acc + curr.totalAmount;
    }, 0);

    const pendingRevenue = totalRevenue - totalReceived;

    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold uppercase tracking-wide">Relatório Financeiro</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20">
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">Recebido</p>
                    <h2 className="text-3xl font-black text-white">R$ {totalReceived.toFixed(2)}</h2>
                    <p className="text-slate-400 text-xs mt-2">Valor já em caixa (Sinais + Pagamentos Totais)</p>
                </div>

                <div className="bg-yellow-500/10 p-6 rounded-2xl border border-yellow-500/20">
                    <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">A Receber</p>
                    <h2 className="text-3xl font-black text-white">R$ {pendingRevenue.toFixed(2)}</h2>
                    <p className="text-slate-400 text-xs mt-2">Valores pendentes de agendamentos futuros</p>
                </div>

                <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20">
                    <p className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Total Projetado</p>
                    <h2 className="text-3xl font-black text-white">R$ {totalRevenue.toFixed(2)}</h2>
                    <p className="text-slate-400 text-xs mt-2">Soma de todos os contratos ativos</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardFinance;
