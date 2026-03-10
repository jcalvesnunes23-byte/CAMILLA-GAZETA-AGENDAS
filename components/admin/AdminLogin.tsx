import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';

const AdminLogin: React.FC = () => {
    const { login } = useStudio();
    const [email, setEmail] = useState('camillanunes.cg@gmail.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const success = await login(password, email);
            if (!success) {
                setError('Credenciais inválidas. Verifique email e senha.');
            }
        } catch (err) {
            setError('Erro ao fazer login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-white">
            <div className="bg-card-dark p-8 rounded-2xl border border-white/5 shadow-2xl max-w-md w-full">
                <div className="flex flex-col items-center mb-8">
                    <span className="material-symbols-outlined text-4xl text-primary mb-2">lock</span>
                    <h1 className="text-xl font-bold uppercase tracking-wide">Acesso Administrativo</h1>
                    <p className="text-slate-400 text-xs mt-2">Área restrita para gerenciamento</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Link do email"
                            disabled={loading}
                            className="w-full bg-background-dark/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 block">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite a senha de acesso"
                            disabled={loading}
                            className="w-full bg-background-dark/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                        />
                        {error && (
                            <p className="text-red-400 text-xs mt-2 text-center font-bold">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all uppercase tracking-wider text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Verificando...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>

                    <div className="mt-4 text-center">
                        <a href="/" className="text-slate-500 hover:text-white text-xs uppercase tracking-wider transition-colors">
                            Voltar ao site
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
