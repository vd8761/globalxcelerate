'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApplicationFiltersState {
  activeTab: string;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;

  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useApplicationFiltersStore = create<ApplicationFiltersState>()(
  persist(
    (set) => ({
      activeTab: 'all',
      searchQuery: '',
      sortBy: 'submitted_at',
      sortOrder: 'desc',
      page: 1,

      setActiveTab: (tab) => set({ activeTab: tab, page: 1 }),
      setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
      setSortBy: (field) => set({ sortBy: field }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setPage: (page) => set({ page }),
      resetFilters: () => set({ activeTab: 'all', searchQuery: '', sortBy: 'submitted_at', sortOrder: 'desc', page: 1 }),
    }),
    {
      name: 'gx-app-filters',
      partialize: (state) => ({
        activeTab: state.activeTab,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
