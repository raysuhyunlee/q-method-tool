import kpopStatements from './kpop.json';
import virtualIdolStatements from './virtual-idol.json';

// Each experiment is served at /:experimentId/:lang.
// `distribution` lists slot counts per column from -4 to +4.
// `preference` is the extra landing-page question; its i18n keys live under `preference.<key>`.
export const experiments = {
  kpop: {
    id: 'kpop',
    title: { ko: 'K-pop 인식 조사', en: 'K-pop Perception Study' },
    languages: ['ko', 'en'],
    statements: kpopStatements,
    distribution: [1, 2, 4, 6, 7, 6, 4, 2, 1],
    preference: 'kpop',
  },
  'virtual-idol': {
    id: 'virtual-idol',
    title: { ko: '버추얼 아이돌 인식 조사', en: 'Virtual Idol Perception Study' },
    languages: ['ko'],
    statements: virtualIdolStatements,
    distribution: [2, 3, 4, 5, 8, 5, 4, 3, 2],
    preference: 'virtualIdol',
  },
};

export const experimentList = Object.values(experiments);

export const getExperiment = (id) => experiments[id] ?? null;

export const getStatements = (experiment, lang) =>
  experiment.statements[lang] ?? experiment.statements[experiment.languages[0]];

export const SCORES = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
