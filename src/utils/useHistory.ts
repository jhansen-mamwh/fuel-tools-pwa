import { useState, useEffect, useRef, useCallback } from 'react';
import { type SharedState } from '../components/Layout';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  mode: string;
  state: Omit<SharedState, 'setFuelType' | 'setObsApi' | 'setObsTemp' | 'setCorrApi' | 'setGrossVol' | 'setWgtVolUnit' | 'setWgtVolAmt'>;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('fuel-tools-history');
    return saved ? JSON.parse(saved) : [];
  });

  const activeEntryId = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('fuel-tools-history', JSON.stringify(history));
  }, [history]);

  const finalizeSave = useCallback(() => {
    activeEntryId.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const recordState = useCallback((mode: string, currentState: any) => {
    // Prevent saving completely empty states
    const hasData = Object.values(currentState).some(val => val !== '' && val !== 'gal' && val !== 'jet a');
    if (!hasData) return;

    const now = Date.now();
    
    // Create new ID *outside* the state updater to survive Strict Mode
    if (!activeEntryId.current) {
      activeEntryId.current = now.toString() + Math.random().toString(36).substring(7);
    }
    const currentId = activeEntryId.current;

    setHistory(prev => {
      let newHistory = [...prev];
      const index = newHistory.findIndex(h => h.id === currentId);

      if (index > -1) {
        // Overwrite existing active draft
        newHistory[index] = { ...newHistory[index], state: currentState, timestamp: now };
      } else {
        // Push new entry
        newHistory.push({ id: currentId, timestamp: now, mode, state: currentState });
      }

      // Enforce the 10-item limit per mode
      const modeItems = newHistory.filter(h => h.mode === mode).sort((a, b) => b.timestamp - a.timestamp);
      if (modeItems.length > 10) {
        const idsToKeep = modeItems.slice(0, 10).map(h => h.id);
        newHistory = newHistory.filter(h => h.mode !== mode || idsToKeep.includes(h.id));
      }

      return newHistory;
    });

    // Reset the 5-second inactivity trigger
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      activeEntryId.current = null;
    }, 5000);
  }, []);

  return { history, recordState, finalizeSave };
}