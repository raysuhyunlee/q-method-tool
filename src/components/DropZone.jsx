import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import styled from 'styled-components';
import DraggableCard from './DraggableCard';

export const SLOT_WIDTH = 150;
export const SLOT_HEIGHT = 88;

const Zone = styled.div`
  width: ${SLOT_WIDTH}px;
  height: ${SLOT_HEIGHT}px;
  border-radius: var(--radius-sm);
  border: 1px dashed ${({ $isOver }) => ($isOver ? 'var(--accent)' : 'var(--border-strong)')};
  background: ${({ $isOver }) => ($isOver ? 'var(--accent-soft)' : 'var(--surface-muted)')};
  transition: background 0.15s, border-color 0.15s;

  ${({ $hasCard, $isOver }) => $hasCard && `
    border: ${$isOver ? '1px solid var(--accent)' : 'none'};
    background: transparent;
  `}
`;

const DropZone = ({ id, currentCard }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Zone ref={setNodeRef} data-slot={id} $isOver={isOver} $hasCard={!!currentCard}>
      {currentCard && <DraggableCard id={currentCard.id} text={currentCard.text} compact />}
    </Zone>
  );
};

export default DropZone;
