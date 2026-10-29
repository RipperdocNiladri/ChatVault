import { create } from "zustand";

interface UIState {
  isCommandPaletteOpen: boolean;
  isShortcutsModalOpen: boolean;
  isMobileMenuOpen: boolean;
  selectedConversationIds: string[];
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  openShortcutsModal: () => void;
  closeShortcutsModal: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleSelectConversation: (id: string) => void;
  selectAllConversations: (ids: string[]) => void;
  clearSelectedConversations: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCommandPaletteOpen: false,
  isShortcutsModalOpen: false,
  isMobileMenuOpen: false,
  selectedConversationIds: [],
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () =>
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  openShortcutsModal: () => set({ isShortcutsModalOpen: true }),
  closeShortcutsModal: () => set({ isShortcutsModalOpen: false }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleSelectConversation: (id) =>
    set((state) => ({
      selectedConversationIds: state.selectedConversationIds.includes(id)
        ? state.selectedConversationIds.filter((item) => item !== id)
        : [...state.selectedConversationIds, id],
    })),
  selectAllConversations: (ids) => set({ selectedConversationIds: ids }),
  clearSelectedConversations: () => set({ selectedConversationIds: [] }),
}));
