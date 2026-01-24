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
  const { userData, qSortResults } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', or null

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const response = await fetch('/api/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData,
          qSortResults,
          locale: lang
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    navigate(`/${lang}/`);
    window.location.reload();
  };

  return (
    <Container>
      <Title>{t('finish.title')}</Title>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
        {t('finish.description') || "Your data is ready."}
      </p>

      {saveStatus && (
        <Message $error={saveStatus === 'error'}>
          {saveStatus === 'success'
            ? "Data saved successfully!"
            : "Failed to save data. Please try again."}
        </Message>
      )}

      <ButtonGroup>
        <Button
          $primary
          onClick={handleSave}
          disabled={isSaving || saveStatus === 'success'}
        >
          {isSaving ? "Saving..." : (t('finish.save_button') || "Save Results")}
        </Button>
        <Button onClick={handleRestart}>
          {t('finish.restart_button')}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default SummaryPage;
