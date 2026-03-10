
import { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: '1cdee5fb-a267-4067-8fd5-ac93c9660c53',
    name: 'Design Simples',
    price: 35,
    description: 'Realce a beleza natural do seu olhar com um design personalizado para o seu formato de rosto.',
    image: 'https://images.unsplash.com/photo-1588510701265-f8525cc334e3?q=80&w=1470&auto=format&fit=crop',
    popular: false
  },
  {
    id: '021c496f-829f-43e2-93dc-b00bd8e64589',
    name: 'Design com Henna',
    price: 45,
    description: 'Definição e preenchimento natural para sobrancelhas marcantes e duradouras.',
    image: 'https://images.unsplash.com/photo-1594917411210-9dc2d1b7776f?q=80&w=1471&auto=format&fit=crop',
    popular: true
  },
  {
    id: 'a235f469-10de-40d3-830d-a6a17c0ed29e',
    name: 'Design Personalizado',
    price: 120,
    description: 'Técnica tendência que deixa os fios alinhados e encorpados, proporcionando um visual volumoso e moderno.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1470&auto=format&fit=crop',
  },
  {
    id: 'd992c0fd-76c5-4602-87c8-ba9ef84abf96',
    name: 'Limpeza de Pele',
    price: 450,
    description: 'Procedimento semi-permanente para sobrancelhas perfeitas, com fios realistas ou efeito shadow.',
    image: 'https://images.unsplash.com/photo-1629853905581-80d45b59ced5?q=80&w=1470&auto=format&fit=crop',
  }
];

export const TIME_SLOTS = [
  '09:00', '10:30', '13:00', '14:30', '16:00', '19:00'
];

export const CALENDAR_DAYS = [
  { day: 1, available: true }, { day: 2, available: true }, { day: 3, available: true }, { day: 4, available: true },
  { day: 5, available: true }, { day: 6, available: true }, { day: 7, available: true }, { day: 8, available: true },
  { day: 9, available: true }, { day: 10, available: true }, { day: 11, available: true }, { day: 12, available: true },
  { day: 13, available: true }, { day: 14, available: true }, { day: 15, available: true }
];
