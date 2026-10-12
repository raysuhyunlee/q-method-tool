import styled from 'styled-components';

export const Button = styled.button`
  height: var(--control-height);
  padding: 0 var(--space-5);
  border-radius: var(--radius-md);
  border: 1px solid ${({ $variant }) => ($variant === 'secondary' ? 'var(--border-strong)' : 'transparent')};
  background: ${({ $variant }) => ($variant === 'secondary' ? 'var(--surface)' : 'var(--accent)')};
  color: ${({ $variant }) => ($variant === 'secondary' ? 'var(--text)' : '#fff')};
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;

  &:hover:not(:disabled) {
    background: ${({ $variant }) => ($variant === 'secondary' ? 'var(--surface-muted)' : 'var(--accent-hover)')};
  }

  &:disabled {
    background: ${({ $variant }) => ($variant === 'secondary' ? 'var(--surface)' : 'var(--border-strong)')};
    color: ${({ $variant }) => ($variant === 'secondary' ? 'var(--text-muted)' : '#fff')};
    cursor: not-allowed;
  }
`;

export const Panel = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
`;

export const PageTitle = styled.h1`
  font-size: var(--font-xl);
  font-weight: 700;
  line-height: 1.3;
`;

export const Muted = styled.p`
  color: var(--text-muted);
`;

export const Alert = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: var(--font-sm);
`;

export const TextButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;
`;
