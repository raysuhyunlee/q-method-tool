import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import i18n from '../i18n';
import { toScores } from '../utils/placements';

const SessionContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => useContext(SessionContext);

const emptyUser = { name: '', age: '', gender: '', preference: '' };

const createSession = () => ({
  sessionId: crypto.randomUUID(),
  userData: emptyUser,
  placements: {},
  completed: false,
});

const storageKey = (experimentId) => `qsort:${experimentId}`;

const loadSession = (experimentId) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(experimentId)));
    if (saved?.sessionId) return { ...createSession(), ...saved };
  } catch {
    // Ignore unreadable storage and start a new session.
  }
  return createSession();
};

const storeSession = (experimentId, session) => {
  try {
    localStorage.setItem(storageKey(experimentId), JSON.stringify(session));
  } catch {
    // Server autosave still runs when browser storage is unavailable.
  }
};

// One participant session per experiment. Every change is kept in localStorage and
// upserted to the server; requests are serialized so the latest state always wins.
export const SessionProvider = ({ experimentId, children }) => {
  const [session, setSession] = useState(() => loadSession(experimentId));
  const [saveState, setSaveState] = useState('idle'); // 'idle' | 'saving' | 'error'

  const latest = useRef(session);
  const version = useRef(0);
  const savedVersion = useRef(0);
  const chain = useRef(Promise.resolve(true));

  const commit = useCallback((next) => {
    latest.current = next;
    version.current += 1;
    storeSession(experimentId, next);
    setSession(next);
  }, [experimentId]);

  const flush = useCallback(() => {
    const run = async () => {
      const target = version.current;
      if (target === savedVersion.current) return true;
      const snapshot = latest.current;
      setSaveState('saving');
      try {
        const response = await fetch('/api/save-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: snapshot.sessionId,
            experimentId,
            userData: snapshot.userData,
            qSortResults: toScores(snapshot.placements),
            locale: i18n.language,
            completed: snapshot.completed,
          }),
        });
        if (!response.ok) throw new Error(`Save failed with ${response.status}`);
        savedVersion.current = Math.max(savedVersion.current, target);
        if (savedVersion.current === version.current) setSaveState('idle');
        return true;
      } catch (error) {
        console.error('Autosave error:', error);
        setSaveState('error');
        return false;
      }
    };
    chain.current = chain.current.then(run);
    return chain.current;
  }, [experimentId]);

  const update = useCallback((patch) => {
    commit({ ...latest.current, ...patch });
    return flush();
  }, [commit, flush]);

  // Marks the session completed only after the server accepts it, so a failed
  // submission keeps the participant on the sort page with their placements.
  const complete = useCallback(async () => {
    latest.current = { ...latest.current, completed: true };
    version.current += 1;
    const ok = await flush();
    if (ok) {
      storeSession(experimentId, latest.current);
      setSession(latest.current);
    } else {
      latest.current = { ...latest.current, completed: false };
      version.current += 1;
    }
    return ok;
  }, [experimentId, flush]);

  const reset = useCallback(() => {
    savedVersion.current = version.current + 1;
    commit(createSession());
    setSaveState('idle');
  }, [commit]);

  return (
    <SessionContext.Provider value={{ ...session, saveState, update, flush, complete, reset }}>
      {children}
    </SessionContext.Provider>
  );
};
