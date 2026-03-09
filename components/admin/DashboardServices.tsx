import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Service } from '../../types';

const DashboardServices: React.FC = () => {
    const { services, updateService, addService, deleteService } = useStudio();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Service | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newServiceForm, setNewServiceForm] = useState<Service>({
        id: '',
        name: '',
        price: 0,
        description: '',
        image: 'https://images.unsplash.com/photo-1604654894611-6973b376cbde?q=80&w=1000&auto=format&fit=crop',
        popular: false,
        addons: []
    });

    const handleEdit = (service: Service) => {
        setEditingId(service.id);
        setEditForm({ ...service });
    };

    const handleSave = async () => {
        if (editForm) {
            try {
                setIsSaving(true);
                await updateService(editForm);
                setEditingId(null);
                setEditForm(null);
            } catch (error) {
                console.error('Erro ao salvar:', error);
                alert('Erro ao salvar serviço. Tente novamente.');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm(null);
        setIsCreating(false);
    };

    const handleCreate = async () => {
        console.log('🚀 Attempting to create service:', newServiceForm);
        if (newServiceForm.name && newServiceForm.price > 0) {
            try {
                setIsSaving(true);
                // Don't pass ID - let Supabase generate it
                await addService({
                    id: '', // Will be ignored by Supabase, it generates its own
                    name: newServiceForm.name,
                    price: newServiceForm.price,
                    description: newServiceForm.description,
                    image: newServiceForm.image,
                    popular: newServiceForm.popular,
                    addons: newServiceForm.addons || []
                });
                console.log('✅ Service created successfully');
                setIsCreating(false);
                setNewServiceForm({
                    id: '',
                    name: '',
                    price: 0,
                    description: '',
                    image: 'https://images.unsplash.com/photo-1604654894611-6973b376cbde?q=80&w=1000&auto=format&fit=crop',
                    popular: false,
                    addons: []
                });
            } catch (error) {
                console.error('❌ Erro ao criar:', error);
                alert('Erro ao criar serviço. Tente novamente.');
            } finally {
                setIsSaving(false);
            }
        } else {
            console.warn('⚠️ Validation failed:', { name: !!newServiceForm.name, price: newServiceForm.price });
            alert('Por favor, preencha o nome do serviço e um preço maior que 0.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) {
            try {
                setIsSaving(true);
                await deleteService(id);
            } catch (error) {
                console.error('Erro ao deletar:', error);
                alert('Erro ao deletar serviço. Tente novamente.');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isCreation: boolean = false) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (isCreation) {
                    setNewServiceForm({ ...newServiceForm, image: reader.result as string });
                } else if (editForm) {
                    setEditForm({ ...editForm, image: reader.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-card-dark p-6 rounded-2xl border border-white/5">
                <div>
                    <h3 className="text-white font-bold uppercase tracking-wide">Gerenciar Serviços</h3>
                    <p className="text-slate-500 text-xs mt-1">Adicione ou edite os serviços oferecidos no studio</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Novo Serviço
                    </button>
                )}
            </div>

            {/* Creation Form */}
            {isCreating && (
                <div className="bg-card-dark rounded-xl border-2 border-primary/50 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                    <div className="p-6 border-b border-white/5 bg-primary/5">
                        <h4 className="text-white font-bold uppercase tracking-wider text-sm">Cadastrar Novo Serviço</h4>
                    </div>
                    <div className="flex flex-col md:flex-row p-6 gap-6">
                        <div className="w-full md:w-48 h-48 relative bg-background-dark rounded-xl overflow-hidden group">
                            <img src={newServiceForm.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="flex flex-col items-center cursor-pointer">
                                    <span className="material-symbols-outlined text-white text-3xl">upload</span>
                                    <span className="text-white text-[10px] font-bold uppercase mt-1">Carregar Foto</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, true)} />
                                </label>
                            </div>
                        </div>
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs text-slate-500 uppercase font-bold">Nome do Serviço</label>
                                <input
                                    type="text"
                                    value={newServiceForm.name}
                                    onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                                    placeholder="Ex: Banho de Gel"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none mt-1"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs text-slate-500 uppercase font-bold">Preço (R$)</label>
                                <input
                                    type="number"
                                    value={newServiceForm.price}
                                    onChange={(e) => setNewServiceForm({ ...newServiceForm, price: Number(e.target.value) })}
                                    placeholder="0"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none mt-1"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 uppercase font-bold">Descrição</label>
                                <textarea
                                    value={newServiceForm.description}
                                    onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                                    placeholder="Descreva os benefícios e detalhes do serviço..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm h-24 focus:border-primary/50 outline-none mt-1 resize-none"
                                />
                            </div>

                            {/* Add-ons Section for Create */}
                            <div className="col-span-2 bg-background-dark/30 p-4 rounded-lg border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs text-slate-500 uppercase font-bold">Serviços Adicionais (Opcionais)</label>
                                    <button
                                        type="button"
                                        onClick={() => setNewServiceForm({
                                            ...newServiceForm,
                                            addons: [...(newServiceForm.addons || []), { name: '', price: 0, active: true }]
                                        })}
                                        className="text-primary text-[10px] font-bold uppercase hover:underline"
                                    >
                                        + Adicionar Item
                                    </button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {(newServiceForm.addons || []).map((addon, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                placeholder="Nome do Adicional"
                                                value={addon.name}
                                                onChange={(e) => {
                                                    const newAddons = [...(newServiceForm.addons || [])];
                                                    newAddons[index].name = e.target.value;
                                                    setNewServiceForm({ ...newServiceForm, addons: newAddons });
                                                }}
                                                className="flex-grow bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                            />
                                            <input
                                                type="number"
                                                placeholder="R$"
                                                value={addon.price}
                                                onChange={(e) => {
                                                    const newAddons = [...(newServiceForm.addons || [])];
                                                    newAddons[index].price = Number(e.target.value);
                                                    setNewServiceForm({ ...newServiceForm, addons: newAddons });
                                                }}
                                                className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newAddons = (newServiceForm.addons || []).filter((_, i) => i !== index);
                                                    setNewServiceForm({ ...newServiceForm, addons: newAddons });
                                                }}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                    {(!newServiceForm.addons || newServiceForm.addons.length === 0) && (
                                        <p className="text-slate-600 text-xs italic">Nenhum serviço adicional cadastrado.</p>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer w-fit">
                                    <input
                                        type="checkbox"
                                        checked={newServiceForm.popular}
                                        onChange={(e) => setNewServiceForm({ ...newServiceForm, popular: e.target.checked })}
                                        className="size-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                    />
                                    <span className="text-sm text-slate-400 font-bold uppercase">Marcar como "Mais Procurado"</span>
                                </label>
                            </div>
                            <div className="col-span-2 flex gap-3 justify-end mt-2">
                                <button onClick={handleCancel} className="px-6 py-3 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition-all">
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={isSaving}
                                    className="px-8 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Criando...' : 'Criar Serviço'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {services.map((service) => (
                    <div key={service.id} className="bg-card-dark rounded-xl border border-white/5 overflow-hidden flex flex-col md:flex-row shadow-lg hover:border-white/10 transition-colors">
                        {/* Image Preview / Upload */}
                        <div className="w-full md:w-48 h-48 relative bg-background-dark group">
                            <img src={editingId === service.id ? editForm?.image : service.image} alt={service.name} className="w-full h-full object-cover" />
                            {editingId === service.id && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <label className="flex flex-col items-center cursor-pointer">
                                        <span className="material-symbols-outlined text-white text-3xl">upload</span>
                                        <span className="text-white text-[10px] font-bold uppercase mt-1">Trocar Foto</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e)} />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-grow p-6 flex flex-col md:flex-row gap-6 items-start">
                            {editingId === service.id && editForm ? (
                                // EDIT MODE
                                <div className="flex-grow w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-xs text-slate-500 uppercase font-bold">Nome do Serviço</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none mt-1"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-xs text-slate-500 uppercase font-bold">Preço (R$)</label>
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none mt-1"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-slate-500 uppercase font-bold">Descrição Detalhada</label>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm h-32 focus:border-primary/50 outline-none mt-1 resize-none"
                                        />
                                    </div>

                                    {/* Add-ons Section for Edit */}
                                    <div className="col-span-2 bg-background-dark/30 p-4 rounded-lg border border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold">Serviços Adicionais (Opcionais)</label>
                                            <button
                                                type="button"
                                                onClick={() => setEditForm({
                                                    ...editForm,
                                                    addons: [...(editForm.addons || []), { name: '', price: 0, active: true }]
                                                })}
                                                className="text-primary text-[10px] font-bold uppercase hover:underline"
                                            >
                                                + Adicionar Item
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {(editForm.addons || []).map((addon, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Nome do Adicional"
                                                        value={addon.name}
                                                        onChange={(e) => {
                                                            const newAddons = [...(editForm.addons || [])];
                                                            newAddons[index].name = e.target.value;
                                                            setEditForm({ ...editForm, addons: newAddons });
                                                        }}
                                                        className="flex-grow bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="R$"
                                                        value={addon.price}
                                                        onChange={(e) => {
                                                            const newAddons = [...(editForm.addons || [])];
                                                            newAddons[index].price = Number(e.target.value);
                                                            setEditForm({ ...editForm, addons: newAddons });
                                                        }}
                                                        className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newAddons = (editForm.addons || []).filter((_, i) => i !== index);
                                                            setEditForm({ ...editForm, addons: newAddons });
                                                        }}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            ))}
                                            {(!editForm.addons || editForm.addons.length === 0) && (
                                                <p className="text-slate-600 text-xs italic">Nenhum serviço adicional cadastrado.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                                            <input
                                                type="checkbox"
                                                checked={editForm.popular}
                                                onChange={(e) => setEditForm({ ...editForm, popular: e.target.checked })}
                                                className="size-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                            />
                                            <span className="text-sm text-slate-400 font-bold uppercase">Marcar como "Mais Procurado"</span>
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                // VIEW MODE
                                <div className="flex-grow">
                                    <h4 className="text-xl font-bold text-white mb-2">{service.name}</h4>
                                    <p className="text-slate-400 text-sm mb-4 leading-relaxed max-w-2xl">{service.description}</p>
                                    <div className="flex flex-col gap-2 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                                                <span className="text-primary font-black text-xs">R$ {service.price},00</span>
                                            </div>
                                            {service.popular && (
                                                <div className="px-3 py-1 bg-accent-green/10 border border-accent-green/20 rounded-full">
                                                    <span className="text-accent-green font-black text-[10px] uppercase">Mais Procurado</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Display Add-ons in View Mode */}
                                        {service.addons && service.addons.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {service.addons.map((addon, idx) => (
                                                    <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-white/5">
                                                        <span className="text-slate-300 text-[10px] font-bold uppercase">+ {addon.name}</span>
                                                        <span className="text-primary text-[10px] font-bold">R$ {addon.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-row md:flex-col gap-2 min-w-[120px] justify-end md:justify-start">
                                {editingId === service.id ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-sm">save</span>
                                                    Salvar
                                                </>
                                            )}
                                        </button>
                                        <button onClick={handleCancel} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition-all">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(service)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/20 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(service.id)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                            Excluir
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardServices;
