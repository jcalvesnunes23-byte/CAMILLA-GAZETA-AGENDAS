import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, Booking } from '../types';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface DayAvailability {
    available: boolean;
    slots: string[]; // ['09:00', '10:30', ...]
}

interface StudioContextType {
    services: Service[];
    bookings: Booking[];
    user: User | null;
    isAdminAuthenticated: boolean;
    availability: Record<string, DayAvailability>; // Key is "YYYY-MM-DD"
    bookedSlots: { date: string; time: string; status: string }[];
    loading: boolean;

    // Actions
    login: (password: string, email: string) => Promise<boolean>;
    logout: () => void;
    updateService: (service: Service) => Promise<void>;
    addService: (service: Service) => Promise<void>;
    deleteService: (id: string) => Promise<void>;
    addBooking: (booking: Booking) => Promise<any>;
    updateBookingStatus: (id: string, status: 'confirmed' | 'completed' | 'cancelled') => Promise<void>;
    deleteBooking: (id: string) => Promise<void>;
    toggleDayAvailability: (date: string) => Promise<void>;
    updateDaySlots: (date: string, slots: string[]) => Promise<void>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookedSlots, setBookedSlots] = useState<{ date: string; time: string; status: string }[]>([]);
    const [availability, setAvailability] = useState<Record<string, DayAvailability>>({});
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Load initial data from Supabase
    useEffect(() => {
        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            loadInitialData(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                loadInitialData(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadInitialData = async (currentUser: User | null) => {
        try {
            setLoading(true);

            // Fetch Services (Public)
            const servicesPromise = supabase.from('services').select('*').order('created_at', { ascending: true })
                .then(res => {
                    if (res.error) throw res.error;
                    const mapped = (res.data || []).map(s => ({
                        id: s.id,
                        name: s.name,
                        price: parseFloat(s.price),
                        description: s.description || '',
                        image: s.image || '',
                        popular: s.popular || false,
                        addons: s.addons || []
                    }));
                    setServices(mapped);
                    return mapped;
                });

            // Fetch Availability (Public)
            const availabilityPromise = supabase.from('availability').select('*')
                .then(res => {
                    if (res.error) throw res.error;
                    const mapped: Record<string, DayAvailability> = {};
                    (res.data || []).forEach(a => {
                        mapped[a.date] = { available: a.available, slots: a.slots || [] };
                    });

                    // Pre-populate defaults if not present
                    const today = new Date();
                    const defaultSlots = ['09:00', '10:30', '13:00', '14:30', '16:00', '19:00'];
                    for (let i = 1; i <= 7; i++) {
                        const date = new Date(today);
                        date.setDate(today.getDate() + i);
                        const dateStr = date.toISOString().split('T')[0];
                        const isSunday = date.getDay() === 0;
                        if (!mapped[dateStr] && !isSunday) {
                            mapped[dateStr] = { available: true, slots: defaultSlots };
                        }
                    }
                    setAvailability(mapped);
                    return mapped;
                });

            // Fetch Public Booked Slots (via Secure RPC)
            const publicBookingsPromise = supabase.rpc('get_booked_slots')
                .then(res => {
                    if (res.error) {
                        console.error('Error fetching booked slots:', res.error);
                    } else if (res.data) {
                        // Map RPC result columns back to our frontend expectations
                        const mappedSlots = res.data.map((slot: any) => ({
                            date: slot.booking_date,
                            time: slot.booking_time,
                            status: slot.booking_status
                        }));
                        setBookedSlots(mappedSlots);
                    }
                });

            // Fetch Admin Bookings (Authenticated Only)
            if (currentUser) {
                supabase.from('appointments').select('*').order('created_at', { ascending: false })
                    .then(res => {
                        if (!res.error && res.data) {
                            const mapped: Booking[] = res.data.map(b => ({
                                id: b.id,
                                serviceId: b.service_id,
                                date: b.date,
                                time: b.time,
                                customerName: b.user_name,
                                customerEmail: b.user_email,
                                customerPhone: b.user_phone,
                                paymentMethod: b.payment_method || 'pix',
                                paymentOption: b.payment_option || 'full',
                                createdAt: b.created_at,
                                status: b.status || 'pending',
                                totalAmount: parseFloat(b.total_amount || b.value || 0),
                                depositAmount: parseFloat(b.deposit_amount || 0),
                                isMaintenance: b.is_maintenance || false,
                                selectedAddons: b.selected_addons || []
                            }));
                            setBookings(mapped);
                        }
                    });
            } else {
                setBookings([]);
            }

            await Promise.all([servicesPromise, availabilityPromise, publicBookingsPromise]);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Authentication
    const login = async (password: string, email: string): Promise<boolean> => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setBookings([]);
    };

    // Services CRUD
    const updateService = async (service: Service) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('services')
                .update({
                    name: service.name,
                    price: service.price,
                    description: service.description,
                    image: service.image,
                    popular: service.popular,
                    addons: service.addons
                })
                .eq('id', service.id)
                .select()
                .single();

            if (error) throw error;

            const updatedService: Service = {
                id: data.id,
                name: data.name,
                price: parseFloat(data.price),
                description: data.description,
                image: data.image,
                popular: data.popular,
                addons: data.addons
            };

            setServices(prev => prev.map(s => s.id === service.id ? updatedService : s));
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    };

    const addService = async (service: Service) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('services')
                .insert({
                    name: service.name,
                    price: service.price,
                    description: service.description,
                    image: service.image,
                    popular: service.popular || false,
                    addons: service.addons || []
                })
                .select()
                .single();

            if (error) throw error;

            const newService: Service = {
                id: data.id,
                name: data.name,
                price: parseFloat(data.price),
                description: data.description,
                image: data.image,
                popular: data.popular,
                addons: data.addons
            };

            setServices(prev => [...prev, newService]);
        } catch (error) {
            console.error('Error adding service:', error);
            throw error;
        }
    };

    const deleteService = async (id: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setServices(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    };

    // Bookings CRUD
    const addBooking = async (booking: Booking) => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .insert({
                    id: booking.id,
                    service_id: booking.serviceId === 'maintenance' ? (services[0]?.id || '1cdee5fb-a267-4067-8fd5-ac93c9660c53') : booking.serviceId,
                    date: booking.date,
                    time: booking.time,
                    user_name: booking.customerName,
                    user_email: booking.customerEmail,
                    user_phone: booking.customerPhone,
                    total_amount: booking.totalAmount,
                    value: booking.totalAmount,
                    status: booking.status || 'pending',
                    is_maintenance: booking.isMaintenance || false,
                    selected_addons: booking.selectedAddons || []
                })
                .select()
                .single();

            if (error) throw error;

            const newMappedBooking: Booking = {
                id: data.id,
                serviceId: data.service_id,
                date: data.date,
                time: data.time,
                customerName: data.user_name,
                customerEmail: data.user_email,
                customerPhone: data.user_phone,
                paymentMethod: data.payment_method || 'pix',
                paymentOption: data.payment_option || 'full',
                createdAt: data.created_at,
                status: data.status || 'pending',
                totalAmount: parseFloat(data.total_amount || data.value || 0),
                depositAmount: parseFloat(data.deposit_amount || 0),
                isMaintenance: data.is_maintenance || false,
                selectedAddons: data.selected_addons || []
            };

            setBookings(prev => [newMappedBooking, ...prev]);

            setBookedSlots(prev => [...prev, {
                date: data.date,
                time: data.time,
                status: 'pending'
            }]);

            return data;
        } catch (error) {
            console.error('Error adding booking:', error);
            throw error;
        }
    };

    const updateBookingStatus = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
            loadInitialData(user); // Refresh to get consistent state
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    };

    const deleteBooking = async (id: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setBookings(prev => prev.filter(b => b.id !== id));
            setBookedSlots(prev => prev.filter(s => !bookings.find(b => b.id === id && b.date === s.date && b.time === s.time)));
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    };

    // Availability CRUD
    const toggleDayAvailability = async (date: string) => {
        if (!user) return;
        const current = availability[date] || { available: false, slots: [] };
        const newAvailable = !current.available;

        try {
            const { error } = await supabase
                .from('availability')
                .upsert({
                    date,
                    available: newAvailable,
                    slots: current.slots
                }, { onConflict: 'date' });

            if (error) throw error;

            setAvailability(prev => ({
                ...prev,
                [date]: { ...current, available: newAvailable }
            }));
        } catch (error) {
            console.error('Error toggling availability:', error);
        }
    };

    const updateDaySlots = async (date: string, slots: string[]) => {
        if (!user) return;
        const current = availability[date] || { available: true, slots: [] };

        try {
            const { error } = await supabase
                .from('availability')
                .upsert({
                    date,
                    available: current.available,
                    slots
                }, { onConflict: 'date' });

            if (error) throw error;

            setAvailability(prev => ({
                ...prev,
                [date]: { ...current, slots }
            }));
        } catch (error) {
            console.error('Error updating slots:', error);
        }
    };

    return (
        <StudioContext.Provider
            value={{
                services,
                bookings,
                bookedSlots,
                user,
                isAdminAuthenticated: !!user,
                availability,
                loading,
                login,
                logout,
                updateService,
                addService,
                deleteService,
                addBooking,
                updateBookingStatus,
                deleteBooking,
                toggleDayAvailability,
                updateDaySlots
            }}
        >
            {children}
        </StudioContext.Provider>
    );
};

export const useStudio = () => {
    const context = useContext(StudioContext);
    if (!context) {
        throw new Error('useStudio must be used within StudioProvider');
    }
    return context;
};
