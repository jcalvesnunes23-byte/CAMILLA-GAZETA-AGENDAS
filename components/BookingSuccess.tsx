import React, { useEffect, useState } from 'react';
import { useStudio } from '../context/StudioContext';

const BookingSuccess: React.FC = () => {
    const [paymentStatus, setPaymentStatus] = useState<'checking' | 'confirmed' | 'pending'>('checking');
    const appointmentId = new URLSearchParams(window.location.search).get('appointment_id');

    useEffect(() => {
        if (!appointmentId) {
            setPaymentStatus('pending');
            return;
        }

        // Poll payment status
        const checkStatus = async () => {
            try {
                const { data } = await fetch(`/api/check-payment?id=${appointmentId}`).then(r => r.json());
                if (data?.payment_status === 'succeeded') {
                    setPaymentStatus('confirmed');
                } else {
                    setPaymentStatus('pending');
                }
            } catch (error) {
                console.error('Error checking payment:', error);
                setPaymentStatus('pending');
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 3000);

        // Stop polling after 30 seconds
        setTimeout(() => clearInterval(interval), 30000);

        return () => clearInterval(interval);
    }, [appointmentId]);

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
            <div className="bg-card-dark p-12 rounded-2xl border border-border-dark shadow-2xl max-w-2xl w-full text-center">
                {paymentStatus === 'checking' && (
                    <>
                        <span className="material-symbols-outlined text-6xl text-primary mb-6 animate-spin">progress_activity</span>
                        <h1 className="text-white text-3xl font-black mb-4">Verificando Pagamento...</h1>
                        <p className="text-slate-400 text-lg">Aguarde enquanto confirmamos seu pagamento.</p>
                    </>
                )}

                {paymentStatus === 'confirmed' && (
                    <>
                        <span className="material-symbols-outlined text-6xl text-accent-green mb-6">check_circle</span>
                        <h1 className="text-white text-3xl font-black mb-4">Pagamento Confirmado!</h1>
                        <p className="text-slate-400 text-lg mb-8">
                            Seu agendamento foi confirmado com sucesso. Você receberá um e-mail com todos os detalhes.
                        </p>
                        <div className="bg-background-dark/50 p-6 rounded-xl border border-white/5 mb-8">
                            <h2 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Próximos Passos</h2>
                            <ul className="text-slate-400 text-left space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                                    <span>Verifique seu e-mail para confirmação</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                                    <span>Chegue 10 minutos antes do horário agendado</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                                    <span>Traga um documento com foto</span>
                                </li>
                            </ul>
                        </div>
                        <a
                            href="/"
                            className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-lg shadow-lg shadow-primary/20 transition-all uppercase tracking-wider text-sm"
                        >
                            Voltar ao Início
                        </a>
                    </>
                )}

                {paymentStatus === 'pending' && (
                    <>
                        <span className="material-symbols-outlined text-6xl text-yellow-500 mb-6">schedule</span>
                        <h1 className="text-white text-3xl font-black mb-4">Pagamento Pendente</h1>
                        <p className="text-slate-400 text-lg mb-8">
                            Ainda estamos processando seu pagamento. Você receberá uma confirmação em breve.
                        </p>
                        <a
                            href="/"
                            className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-lg shadow-lg shadow-primary/20 transition-all uppercase tracking-wider text-sm"
                        >
                            Voltar ao Início
                        </a>
                    </>
                )}
            </div>
        </div>
    );
};

export default BookingSuccess;
