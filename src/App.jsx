import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LandingPage from './pages/LandingPage';
import SortPage from './pages/SortPage';
import SummaryPage from './pages/SummaryPage';
import LanguageSelector from './components/LanguageSelector';
import './App.css';
import './i18n';

// Wrapper to handle language Param and i18n sync
const LanguageWrapper = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    if ((lang === 'ko' || lang === 'en') && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  if (lang !== 'ko' && lang !== 'en') {
    return <Navigate to="/ko" replace />;
  }

  return (
    <div className="app-container">
      <LanguageSelector />
      <Outlet />
    </div>
  );
};

import { UserProvider } from './context/UserContext';

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/ko" replace />} />
          <Route path="/:lang" element={<LanguageWrapper />}>
            <Route index element={<LandingPage />} />
            <Route path="sort" element={<SortPage />} />
            <Route path="finish" element={<SummaryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
