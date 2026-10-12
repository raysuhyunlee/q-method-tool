import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import styled from 'styled-components';

const Card = styled.div`
  display: flex;
  gap: var(--space-2);
  width: 100%;
  height: ${({ $compact }) => ($compact ? '100%' : 'auto')};
  padding: ${({ $compact }) => ($compact ? 'var(--space-2)' : 'var(--space-3)')};
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: ${({ $overlay }) => ($overlay ? 'var(--shadow-md)' : 'var(--shadow-sm)')};
  font-size: ${({ $compact }) => ($compact ? '0.78rem' : 'var(--font-sm)')};
  line-height: 1.4;
  text-align: left;
  cursor: grab;
  user-select: none;
  touch-action: none;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.35 : 1)};
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--border-strong);
  }

  &:active {
    cursor: grabbing;
  }
`;

const IdBadge = styled.span`
  flex: none;
  min-width: 1.75em;
  color: var(--text-muted);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

const StatementText = styled.span`
  display: -webkit-box;
  -webkit-line-clamp: ${({ $compact }) => ($compact ? 4 : 'unset')};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const CardView = ({ id, text, compact = false, overlay = false, ...rest }) => (
  <Card $compact={compact} $overlay={overlay} title={compact ? text : undefined} {...rest}>
    {!compact && <IdBadge>{id}</IdBadge>}
    <StatementText $compact={compact}>{text}</StatementText>
  </Card>
);

const DraggableCard = ({ id, text, compact = false }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `card-${id}`,
    data: { id, text },
  });

  return (
    <CardView
      ref={setNodeRef}
      id={id}
      text={text}
      compact={compact}
      $isDragging={isDragging}
      {...listeners}
      {...attributes}
    />
  );
};

export default DraggableCard;
