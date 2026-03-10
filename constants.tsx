
import { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: '539114f9-2e63-486c-a897-5e014eb57b29',
    name: 'ALONGAMENTO MOLDE F1',
    price: 150,
    description: 'Alongamento premium utilizando a técnica de molde F1 para um acabamento perfeito e natural.',
    image: 'https://images.unsplash.com/photo-1604654894610-df490998700d?q=80&w=1374&auto=format&fit=crop',
    popular: true
  },
  {
    id: '2575f308-126b-493c-b23f-8d2a964202c8',
    name: 'BLINDAGEM EM GEL',
    price: 80,
    description: 'Proteção e fortalecimento para suas unhas naturais com camada de gel de alta resistência.',
    image: 'https://images.unsplash.com/photo-1636019280638-4d2247051319?q=80&w=1470&auto=format&fit=crop',
  },
  {
    id: '5986ca83-a1c1-4091-aba6-f202634b8c78',
    name: 'BANHO DE GEL',
    price: 100,
    description: 'Camada de gel sobre a unha natural para garantir brilho e durabilidade impecáveis.',
    image: 'https://images.unsplash.com/photo-1604654894611-6973b376cbde?q=80&w=1374&auto=format&fit=crop',
  },
  {
    id: 'aea0e278-da66-4d0c-a889-b3e65a7bd330',
    name: 'ESMALTAÇÃO EM GEL',
    price: 60,
    description: 'Esmaltação de longa duração que não descasca e mantém o brilho por semanas.',
    image: 'https://images.unsplash.com/photo-1639502512411-7299a4e8d89e?q=80&w=1374&auto=format&fit=crop',
  },
  {
    id: 'ac627d9f-1776-4e80-b25d-a2acb97efe52',
    name: 'MANUTENÇÃO',
    price: 120,
    description: 'Manutenção periódica para manter seu alongamento sempre impecável e seguro.',
    image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=1470&auto=format&fit=crop',
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
