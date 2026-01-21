import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { exportData } from '../utils/dataExporter';
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

const SummaryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const { userData, qSortResults } = useUser();

  const handleDownload = () => {
    exportData(userData, qSortResults);
  };

  const handleRestart = () => {
    // Ideally clear context, but simplified restart loop:
    navigate(`/${lang}/`);
    window.location.reload(); // Hard reset to clear state
  };

  return (
    <Container>
      <Title>{t('finish.title')}</Title>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
        {t('finish.description') || "Your data is ready."}
      </p>

      <ButtonGroup>
        <Button $primary onClick={handleDownload}>
          {t('finish.download_button')}
        </Button>
        <Button onClick={handleRestart}>
          {t('finish.restart_button')}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default SummaryPage;
