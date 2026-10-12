import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';

const LABELS = { ko: '한국어', en: 'English' };

const Group = styled.div`
  ${({ $inline }) => !$inline && `
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
  `}
  display: flex;
  padding: 2px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  z-index: 10;
`;

const Option = styled.button`
  padding: var(--space-1) var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: ${({ $active }) => ($active ? 'var(--border-strong)' : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? 'var(--shadow-sm)' : 'none')};
  color: ${({ $active }) => ($active ? 'var(--text)' : 'var(--text-muted)')};
  font-size: var(--font-sm);
  font-weight: 600;
  cursor: pointer;
`;

const LanguageSelector = ({ languages, inline = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { experimentId, lang } = useParams();

  const changeLanguage = (next) => {
    if (next === lang) return;
    const rest = location.pathname.slice(`/${experimentId}/${lang}`.length);
    navigate(`/${experimentId}/${next}${rest}`);
  };

  return (
    <Group role="group" aria-label="Language" $inline={inline}>
      {languages.map((code) => (
        <Option key={code} $active={code === lang} aria-pressed={code === lang} onClick={() => changeLanguage(code)}>
          {LABELS[code] ?? code}
        </Option>
      ))}
    </Group>
  );
};

export default LanguageSelector;
