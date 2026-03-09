import React from 'react';

const BookingCancelled: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
            <div className="bg-card-dark p-12 rounded-2xl border border-border-dark shadow-2xl max-w-2xl w-full text-center">
                <span className="material-symbols-outlined text-6xl text-red-400 mb-6">cancel</span>
                <h1 className="text-white text-3xl font-black mb-4">Pagamento Cancelado</h1>
                <p className="text-slate-400 text-lg mb-8">
                    Você cancelou o processo de pagamento. Não se preocupe, nenhuma cobrança foi realizada.
                </p>

                <div className="bg-background-dark/50 p-6 rounded-xl border border-white/5 mb-8">
                    <h2 className="text-white font-bold uppercase tracking-wider text-sm mb-4">O que aconteceu?</h2>
                    <p className="text-slate-400 text-left">
                        O agendamento foi criado, mas não foi confirmado porque o pagamento não foi concluído.
                        Você pode tentar novamente a qualquer momento.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="/"
                        className="inline-block bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-8 rounded-lg transition-all uppercase tracking-wider text-sm"
                    >
                        Voltar ao Início
                    </a>
                    <a
                        href="/agendar"
                        className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-lg shadow-lg shadow-primary/20 transition-all uppercase tracking-wider text-sm"
                    >
                        Tentar Novamente
                    </a>
                </div>
            </div>
        </div>
    );
};

export default BookingCancelled;
