import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useSession } from '../context/SessionContext';
import QSortBoard from '../components/QSortBoard';
import { Alert, Button, TextButton } from '../components/ui';
import { getStatements } from '../experiments';

const PageContainer = styled.div`
  width: 100%;
  max-width: 1440px;
  padding: var(--space-7) var(--space-4) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3) var(--space-5);
  padding: var(--space-3) 0;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(8px);
`;

const Instruction = styled.p`
  font-size: var(--font-lg);
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
`;

const Progress = styled.span`
  color: var(--text-muted);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

const SortPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { experimentId, lang } = useParams();
  const experiment = useOutletContext();
  const { userData, placements, completed, saveState, update, flush, complete } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  const statements = useMemo(() => getStatements(experiment, i18n.language), [experiment, i18n.language]);

  if (completed) return <Navigate to={`/${experimentId}/${lang}/finish`} replace />;
  if (!userData.name) return <Navigate to={`/${experimentId}/${lang}`} replace />;

  const placedCount = Object.keys(placements).length;
  const isComplete = placedCount === statements.length;

  const handleChange = (next) => {
    setSubmitFailed(false);
    update({ placements: next });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const ok = await complete();
    setSubmitting(false);
    if (ok) navigate(`/${experimentId}/${lang}/finish`);
    else setSubmitFailed(true);
  };

  return (
    <PageContainer>
      <Header>
        <Instruction>{t('sort.instruction')}</Instruction>
        <Actions>
          <Progress aria-label={`${placedCount} / ${statements.length}`}>
            {placedCount} / {statements.length}
          </Progress>
          <Button onClick={handleSubmit} disabled={!isComplete || submitting}>
            {t(submitting ? 'sort.submitting' : 'sort.finish_button')}
          </Button>
        </Actions>
      </Header>

      {submitFailed ? (
        <Alert role="alert">{t('sort.submit_failed')}</Alert>
      ) : saveState === 'error' && (
        <Alert role="alert">
          <span>{t('sort.save_failed')}</span>
          <TextButton onClick={flush}>{t('sort.retry_button')}</TextButton>
        </Alert>
      )}

      <QSortBoard
        statements={statements}
        distribution={experiment.distribution}
        placements={placements}
        onChange={handleChange}
      />
    </PageContainer>
  );
};

export default SortPage;
