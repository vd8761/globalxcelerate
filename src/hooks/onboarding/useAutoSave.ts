'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { AUTOSAVE_DEBOUNCE_MS } from '@/lib/onboarding/constants';

export function useAutoSave(stepName: string, formData: unknown, enabled = true) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);
  const lastDataRef = useRef<string>('');
  const isMounted = useRef(true);

  const { setSaveStatus, markDirty, markClean, updateLastSaved, setCompletionPercentage } = useOnboardingStore();
  const saveStatus = useOnboardingStore((s) => s.saveStatus);
  const lastSavedAt = useOnboardingStore((s) => s.lastSavedAt);

  const performSave = useCallback(async (data: unknown) => {
    if (!isMounted.current) return;
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/v1/students/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepName, data, action: 'save' }),
      });
      if (!res.ok) throw new Error('Save failed');
      const result = await res.json();
      if (!isMounted.current) return;
      setSaveStatus('saved');
      markClean(stepName);
      updateLastSaved();
      retryCount.current = 0;
      if (result.data?.completion_percentage != null) {
        setCompletionPercentage(result.data.completion_percentage);
      }
    } catch {
      if (!isMounted.current) return;
      retryCount.current += 1;
      if (retryCount.current <= 3) {
        const delay = Math.pow(2, retryCount.current) * 1000;
        timerRef.current = setTimeout(() => performSave(data), delay);
      } else {
        setSaveStatus('error', 'Auto-save failed after retries');
      }
    }
  }, [stepName, setSaveStatus, markClean, updateLastSaved, setCompletionPercentage]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const serialized = JSON.stringify(formData);
    if (serialized === lastDataRef.current) return;
    lastDataRef.current = serialized;
    markDirty(stepName);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      performSave(formData);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [formData, enabled, stepName, markDirty, performSave]);

  const flush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const serialized = JSON.stringify(formData);
    if (serialized !== '{}' && serialized !== '[]') {
      performSave(formData);
    }
  }, [formData, performSave]);

  const retryManually = useCallback(() => {
    retryCount.current = 0;
    performSave(formData);
  }, [formData, performSave]);

  return { saveStatus, lastSavedAt, flush, retryManually };
}
