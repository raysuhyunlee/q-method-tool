import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
  color: white;
  animation: fadeIn 0.8s ease-out;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 40px;
`;

const Button = styled.button`
  padding: 16px 32px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${props => props.$primary
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$primary ? 'white' : '#cbd5e1'};
  border: ${props => props.$primary ? 'none' : '1px solid rgba(255,255,255,0.2)'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.$primary ? '0 10px 20px -10px rgba(118, 75, 162, 0.5)' : 'none'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.$primary
    ? '0 15px 30px -10px rgba(118, 75, 162, 0.6)'
    : '0 5px 15px -5px rgba(0,0,0,0.1)'};
    background: ${props => props.$primary
    ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
    : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const Message = styled.p`
  font-size: 1.1rem;
  margin-top: 20px;
  color: ${props => props.$error ? '#ff6b6b' : '#4cd137'};
  min-height: 27px;
`;

const SummaryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const { saveResults, saveStatus } = useUser();

  useEffect(() => {
    // Automatically trigger save when page loads
    if (saveStatus === 'idle') {
      saveResults(lang);
    }
  }, [lang, saveResults, saveStatus]);

  const handleRestart = () => {
    navigate(`/${lang}/`);
    window.location.reload();
  };

  const handleRetry = () => {
    saveResults(lang);
  };

  return (
    <Container>
      <Title>{t('finish.title')}</Title>

      {saveStatus === 'saving' && (
        <p style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }}>
          {t('sort.saving') || "Saving your data..."}
        </p>
      )}

      {saveStatus === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <Message $error>
            {t('sort.save_failed') || "Failed to save data. Please try again."}
          </Message>
          <Button $primary onClick={handleRetry}>
            {t('sort.retry_button') || "Retry Save"}
          </Button>
        </div>
      )}

      {saveStatus === 'success' && (
        <>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
            {t('finish.description') || "Your data has been saved successfully."}
          </p>
          <Message>
            {t('finish.save_success_message') || "Thank you for your participation!"}
          </Message>
        </>
      )}

      <ButtonGroup>
        <Button onClick={handleRestart} $primary={saveStatus === 'success'}>
          {t('finish.restart_button')}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default SummaryPage;
