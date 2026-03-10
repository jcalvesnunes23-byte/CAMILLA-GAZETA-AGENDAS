
export enum Page {
  LANDING = 'landing',
  CHECKOUT = 'checkout',
  ADMIN = 'admin'
}


export interface ServiceAddon {
  name: string;
  price: number;
  active: boolean; // Used in admin to toggle availability
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  popular?: boolean;
  addons?: ServiceAddon[];
}

export interface BookingState {
  serviceId: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCPF: string;
  selectedAddons: { name: string; price: number }[];
}

export interface Booking extends BookingState {
  id: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  isMaintenance?: boolean;
  paymentMethod?: string;
  paymentOption?: string;
  depositAmount?: number;
}
