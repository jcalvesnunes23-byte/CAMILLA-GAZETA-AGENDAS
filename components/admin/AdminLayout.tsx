import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Page } from '../../types';
import AdminLogin from './AdminLogin';
import DashboardOverview from './DashboardOverview';
import DashboardAgenda from './DashboardAgenda';
import DashboardFinance from './DashboardFinance';
import DashboardServices from './DashboardServices';
import DashboardHours from './DashboardHours';

interface AdminLayoutProps {
    onNavigate: (page: Page) => void;
}

type AdminTab = 'overview' | 'agenda' | 'finance' | 'services' | 'hours';

const AdminLayout: React.FC<AdminLayoutProps> = ({ onNavigate }) => {
    const { isAdminAuthenticated, logout } = useStudio();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');

    if (!isAdminAuthenticated) {
        return <AdminLogin />;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <DashboardOverview />;
            case 'agenda': return <DashboardAgenda />;
            case 'finance': return <DashboardFinance />;
            case 'services': return <DashboardServices />;
            case 'hours': return <DashboardHours />;
            default: return <DashboardOverview />;
        }
    };

    const navItems: { id: AdminTab; label: string; icon: string }[] = [
        { id: 'overview', label: 'Visão Geral', icon: 'dashboard' },
        { id: 'agenda', label: 'Agendas', icon: 'calendar_month' },
        { id: 'finance', label: 'Financeiro', icon: 'payments' },
        { id: 'services', label: 'Serviços', icon: 'spa' },
        { id: 'hours', label: 'Horários', icon: 'schedule' },
    ];

    return (
        <div className="min-h-screen bg-background-dark text-white flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-card-dark border-r border-white/5 flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-10 flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold uppercase tracking-tight text-sm">Painel Admin</span>
                    </div>
                </div>

                <nav className="flex-grow p-4 space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium ${activeTab === item.id
                                ? 'bg-primary/20 text-primary border border-primary/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => onNavigate(Page.LANDING)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm mb-2"
                    >
                        <span className="material-symbols-outlined">home</span>
                        Ver Site
                    </button>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Sair
                    </button>
                </div>
            </aside>

            <main className="flex-grow flex flex-col h-screen overflow-hidden">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-background-dark/95 backdrop-blur-sm z-10">
                    <h2 className="text-base md:text-xl font-bold uppercase tracking-wide truncate pr-4">
                        {navItems.find(i => i.id === activeTab)?.label}
                    </h2>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs md:text-sm font-medium">Camilla Gazeta</span>
                    </div>
                </header>

                <div className="flex-grow overflow-auto p-4 md:p-8">
                    {renderTabContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
