import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import styled from 'styled-components';
import DraggableCard from './DraggableCard';

const Zone = styled.div`
  width: 140px;
  height: 100px;
  background: ${props => props.$isOver ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px dashed ${props => props.$isOver ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin: 4px;
  
  /* If occupied, style differently */
  ${props => props.$hasCard && `
    border-style: solid;
    background: transparent;
    border: none;
  `}
`;

const ScoreLabel = styled.div`
  position: absolute;
  top: -20px;
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const DropZone = ({ id, currentCard, score }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: { score } // identifying this zone's score
  });

  return (
    <div style={{ position: 'relative' }}>
      {/* Optional: Show score label only on top row or handle externally */}
      <Zone ref={setNodeRef} $isOver={isOver} $hasCard={!!currentCard}>
        {currentCard ? (
          <DraggableCard id={currentCard.id} text={currentCard.text} hideId={true} />
        ) : null}
      </Zone>
    </div>
  );
};

export default DropZone;
