import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  color: #333;
  border-radius: 8px;
  padding: 12px;
  margin: 4px;
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 0.9rem;
  font-weight: 500;
  user-select: none;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid #e2e8f0;
  
  touch-action: none; /* Required for dnd-kit on mobile */
  transform: ${props => (props.$isDragging ? 'scale(1.05)' : 'scale(1)')};
  opacity: ${props => (props.$isDragging ? '0.8' : '1')};
  z-index: ${props => (props.$isDragging ? '999' : 'auto')};
  
  &:active {
    cursor: grabbing;
  }
`;

const DraggableCard = ({ id, text }) => {
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
      {...listeners}
      {...attributes}
    >
      {text}
    </Card>
  );
};

export default DraggableCard;
