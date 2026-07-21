import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { readingReducer, createInitialReadingState, type ReadingState, type ReadingAction } from '@/lib/state/readingReducer';

const ReadingCtx = createContext<{
  state: ReadingState;
  dispatch: React.Dispatch<ReadingAction>;
} | null>(null);

export function ReadingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(readingReducer, undefined, createInitialReadingState);
  return <ReadingCtx.Provider value={{ state, dispatch }}>{children}</ReadingCtx.Provider>;
}

export function useReading() {
  const ctx = useContext(ReadingCtx);
  if (!ctx) throw new Error('useReading must be used within ReadingProvider');
  return ctx;
}
