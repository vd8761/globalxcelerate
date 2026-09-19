'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApplicationDocument } from '@/types/marketplace';

interface ApplyDraft {
  cover_letter: string;
  documents: ApplicationDocument[];
  additional_answers: Record<string, string>;
  lastSaved: string;
}

interface ApplyDraftState {
  drafts: Record<string, ApplyDraft>;
  saveDraft: (opportunityId: string, data: Partial<ApplyDraft>) => void;
  getDraft: (opportunityId: string) => ApplyDraft | null;
  clearDraft: (opportunityId: string) => void;
}

export const useApplyDraftStore = create<ApplyDraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      saveDraft: (opportunityId, data) => set((state) => ({
        drafts: {
          ...state.drafts,
          [opportunityId]: {
            cover_letter: data.cover_letter ?? state.drafts[opportunityId]?.cover_letter ?? '',
            documents: data.documents ?? state.drafts[opportunityId]?.documents ?? [],
            additional_answers: data.additional_answers ?? state.drafts[opportunityId]?.additional_answers ?? {},
            lastSaved: new Date().toISOString(),
          },
        },
      })),
      getDraft: (opportunityId) => get().drafts[opportunityId] || null,
      clearDraft: (opportunityId) => set((state) => {
        const { [opportunityId]: _, ...rest } = state.drafts;
        return { drafts: rest };
      }),
    }),
    { name: 'gx-apply-drafts' }
  )
);
