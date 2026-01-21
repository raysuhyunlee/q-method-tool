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

  const saveResults = (results) => {
    setQSortResults(results);
    // You might want to persist partial results too
  };

  return (
    <UserContext.Provider value={{ userData, updateUser, qSortResults, saveResults }}>
      {children}
    </UserContext.Provider>
  );
};
