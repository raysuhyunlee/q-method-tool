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

  const saveResults = (placements) => {
    // Transform placements from { "slot-score-index": cardId } to { cardId: score }
    const results = {};
    Object.keys(placements).forEach(slotId => {
      const cardId = placements[slotId];
      // Extract score from slotId (format: "slot-score-index")
      const match = slotId.match(/^slot-(-?\d+)-\d+$/);
      if (match) {
        const score = parseInt(match[1]);
        results[cardId] = score;
      }
    });
    setQSortResults(results);
    // You might want to persist partial results too
  };

  return (
    <UserContext.Provider value={{ userData, updateUser, qSortResults, saveResults }}>
      {children}
    </UserContext.Provider>
  );
};
