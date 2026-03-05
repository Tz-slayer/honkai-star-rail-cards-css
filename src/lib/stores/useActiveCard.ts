import { create } from 'zustand'

interface ActiveCardStore {
  activeCard: HTMLElement | null
  setActiveCard: (card: HTMLElement | null) => void
}

export const useActiveCard = create<ActiveCardStore>((set) => ({
  activeCard: null,
  setActiveCard: (card) => set({ activeCard: card }),
}))
