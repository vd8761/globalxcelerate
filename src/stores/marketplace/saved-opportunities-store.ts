'use client';

import { create } from 'zustand';

interface SavedOpportunitiesState {
  savedIds: Set<string>;
  addSaved: (id: string) => void;
  removeSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  initializeFromServer: (ids: string[]) => void;
}

export const useSavedOpportunitiesStore = create<SavedOpportunitiesState>((set, get) => ({
  savedIds: new Set<string>(),
  addSaved: (id) => set((state) => {
    const newSet = new Set(state.savedIds);
    newSet.add(id);
    return { savedIds: newSet };
  }),
  removeSaved: (id) => set((state) => {
    const newSet = new Set(state.savedIds);
    newSet.delete(id);
    return { savedIds: newSet };
  }),
  isSaved: (id) => get().savedIds.has(id),
  initializeFromServer: (ids) => set({ savedIds: new Set(ids) }),
}));
