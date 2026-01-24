import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: '',
    kpopPreference: ''
  });

  const [qSortResults, setQSortResults] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'success', 'error'
  const [stagedPlacements, setStagedPlacements] = useState(null);

  // Load from localStorage on mount (optional, helps with refresh)
  useEffect(() => {
    const saved = localStorage.getItem('qMethodUser');
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  }, []);

  const updateUser = (data) => {
    setUserData(prev => {
      const newData = { ...prev, ...data };
      localStorage.setItem('qMethodUser', JSON.stringify(newData));
      return newData;
    });
  };

  const prepResults = (placements) => {
    setStagedPlacements(placements);
    setSaveStatus('idle'); // Reset status for new submission
  };

  const saveResults = async (locale) => {
    if (!stagedPlacements) return false;

    setSaveStatus('saving');
    // Transform placements from { "slot-score-index": cardId } to { cardId: score }
    const results = {};
    Object.keys(stagedPlacements).forEach(slotId => {
      const cardId = stagedPlacements[slotId];
      // Extract score from slotId (format: "slot-score-index")
      const match = slotId.match(/^slot-(-?\d+)-\d+$/);
      if (match) {
        const score = parseInt(match[1]);
        results[cardId] = score;
      }
    });

    try {
      const response = await fetch('/api/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData,
          qSortResults: results,
          locale: locale
        }),
      });

      if (response.ok) {
        setQSortResults(results);
        setSaveStatus('success');
        return true;
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ userData, updateUser, qSortResults, saveResults, saveStatus, prepResults }}>
      {children}
    </UserContext.Provider>
  );
};
