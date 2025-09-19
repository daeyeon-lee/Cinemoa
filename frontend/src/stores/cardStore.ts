import { create } from 'zustand';

export interface CardInfo {
  cardNumber: string[];
  expiryDate: string;
  cvc: string;
  password: string;
  birthDate: string;
}

interface CardStore {
  cards: CardInfo[];
  addCard: (card: CardInfo) => void;
  removeCard: (index: number) => void;
  clearCards: () => void;
}

export const useCardStore = create<CardStore>()((set) => ({
  cards: [],
  addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
  removeCard: (index) => set((state) => ({ 
    cards: state.cards.filter((_, i) => i !== index) 
  })),
  clearCards: () => set({ cards: [] }),
}));
