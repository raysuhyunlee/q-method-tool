import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ExperimentIndex from './pages/ExperimentIndex';
import LandingPage from './pages/LandingPage';
import SortPage from './pages/SortPage';
import SummaryPage from './pages/SummaryPage';
import LanguageSelector from './components/LanguageSelector';
import { SessionProvider } from './context/SessionContext';
import { experimentList, getExperiment } from './experiments';
import './i18n';

const AdminPage = lazy(() => import('./pages/AdminPage'));

const LEGACY_LANGS = ['ko', 'en'];
const LEGACY_EXPERIMENT = 'kpop';

const ExperimentLayout = () => {
  const { experimentId } = useParams();
  const location = useLocation();

  // Links from before multi-experiment support (/ko, /en/sort, …) belong to the K-pop study.
  if (LEGACY_LANGS.includes(experimentId)) {
    return <Navigate to={`/${LEGACY_EXPERIMENT}${location.pathname}`} replace />;
  }

  const experiment = getExperiment(experimentId);
  if (!experiment) return <Navigate to="/" replace />;

  return (
    <SessionProvider key={experiment.id} experimentId={experiment.id}>
      <Outlet context={experiment} />
    </SessionProvider>
  );
};

const ExperimentHome = () => {
  const { experimentId } = useParams();
  return <Navigate to={`/${experimentId}/${getExperiment(experimentId).languages[0]}`} replace />;
};

const LanguageLayout = () => {
  const { experimentId, lang } = useParams();
  const { i18n } = useTranslation();
  const experiment = getExperiment(experimentId);
  const supported = experiment.languages.includes(lang);

  useEffect(() => {
    if (supported && i18n.language !== lang) i18n.changeLanguage(lang);
  }, [lang, supported, i18n]);

  if (!supported) return <Navigate to={`/${experimentId}/${experiment.languages[0]}`} replace />;

  return (
    <div className="app-container">
      {experiment.languages.length > 1 && <LanguageSelector languages={experiment.languages} />}
      <Outlet context={experiment} />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<ExperimentIndex />} />
          <Route path="/admin" element={<Navigate to={`/admin/${experimentList[0].id}`} replace />} />
          <Route path="/admin/:experimentId" element={<AdminPage />} />
          <Route path="/:experimentId" element={<ExperimentLayout />}>
            <Route index element={<ExperimentHome />} />
            <Route path=":lang" element={<LanguageLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="sort" element={<SortPage />} />
              <Route path="finish" element={<SummaryPage />} />
            </Route>
            <Route path="*" element={<ExperimentHome />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
