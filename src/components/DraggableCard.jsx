import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  color: #333;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 6px 0;
  cursor: grab;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  font-size: 0.95rem;
  font-weight: 500;
  user-select: none;
  min-height: auto;
  display: grid;
  grid-template-columns: ${props => props.$hideId ? '1fr' : '40px 1fr'};
  align-items: center;
  text-align: left;
  border: 1px solid #e2e8f0;
  width: 100%;
  
  touch-action: none;
  transform: ${props => (props.$isDragging ? 'scale(1.02)' : 'scale(1)')};
  opacity: ${props => (props.$isDragging ? '0.9' : '1')};
  z-index: ${props => (props.$isDragging ? '999' : 'auto')};
  
  &:active {
    cursor: grabbing;
    background: #f8fafc;
  }
`;

const IdBadge = styled.div`
  font-weight: 700;
  color: var(--primary-color);
  font-size: 0.9rem;
`;

const StatementText = styled.div`
  line-height: 1.3;
  width: 100%;
  
  /* Truncation logic */
  display: -webkit-box;
  -webkit-line-clamp: 4; /* Show max 4 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DraggableCard = ({ id, text, hideId = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${id}`,
    data: { id, text }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
      $hideId={hideId}
      title={text}
      {...listeners}
      {...attributes}
    >
      {!hideId && <IdBadge>{id}</IdBadge>}
      <StatementText>{text}</StatementText>
    </Card>
  );
};

export default DraggableCard;
