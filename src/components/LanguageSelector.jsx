import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';

const SelectorContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 1000;
`;

const LangButton = styled.button`
  background: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.$active ? '#333' : '#fff'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
  font-weight: 600;

  &:hover {
    background: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.4)'};
  }
`;

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();

  const changeLanguage = (newLang) => {
    if (newLang === lang) return;

    i18n.changeLanguage(newLang);
    const newPath = location.pathname.replace(/^\/(en|ko)/, `/${newLang}`);
    navigate(newPath);
  };

  return (
    <SelectorContainer>
      <LangButton $active={lang === 'ko'} onClick={() => changeLanguage('ko')}>
        한국어
      </LangButton>
      <LangButton $active={lang === 'en'} onClick={() => changeLanguage('en')}>
        English
      </LangButton>
    </SelectorContainer>
  );
};

export default LanguageSelector;
