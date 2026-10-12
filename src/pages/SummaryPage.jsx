import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useSession } from '../context/SessionContext';
import { Button, Muted, PageTitle } from '../components/ui';

const Container = styled.div`
  min-height: 80vh;
  padding: var(--space-7) var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  text-align: center;
`;

const Actions = styled.div`
  margin-top: var(--space-6);
`;

const SummaryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { experimentId, lang } = useParams();
  const { completed, reset } = useSession();

  if (!completed) return <Navigate to={`/${experimentId}/${lang}`} replace />;

  const handleRestart = () => {
    reset();
    navigate(`/${experimentId}/${lang}`);
  };

  return (
    <Container>
      <PageTitle>{t('finish.title')}</PageTitle>
      <Muted>{t('finish.description')}</Muted>
      <Actions>
        <Button $variant="secondary" onClick={handleRestart}>
          {t('finish.restart_button')}
        </Button>
      </Actions>
    </Container>
  );
};

export default SummaryPage;
