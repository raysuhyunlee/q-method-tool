import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import styled from 'styled-components';
import DraggableCard from './DraggableCard';
import DropZone from './DropZone';

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 40px;
`;

const PyramidContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  overflow-x: auto;
  padding: 20px;
  min-height: 400px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const ColumnHeader = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  color: ${props => props.$score === 0 ? 'var(--accent-color)' : 'var(--text-primary)'};
`;

const DeckContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  min-height: 200px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CategoryGroup = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;
  
  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryTitle = styled.h3`
  color: var(--accent-color);
  font-size: 1.1rem;
  font-weight: 600;
  padding-top: 10px;
`;

const CardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  &:hover::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const DeckTitle = styled.h3`
  width: 100%;
  text-align: center;
  margin-bottom: 15px;
  color: var(--text-secondary);
`;

const QSortBoard = ({ statements, distribution, onComplete }) => {
  const [items, setItems] = useState([]); // All statements
  const [placements, setPlacements] = useState({}); // { 'score-index': cardId }
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setItems(statements);
  }, [statements]);

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id.replace('card-', ''));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    const cardId = active.id.replace('card-', '');

    if (!over) {
      // Dropped outside -> return to deck?
      // Actually, if it was in a slot, remove it.
      // But dnd-kit doesn't auto-revert unless we handle it.
      // Let's implement: if dropped on deck, remove from placements.

      // Currently: if invalid, do nothing (snap back handled by dnd-kit visual, but state remains)
      return;
    }

    // Check if drop target is the Deck
    if (over.id === 'deck') {
      setPlacements(prev => {
        const next = { ...prev };
        // Find key having this cardId and delete
        Object.keys(next).forEach(key => {
          if (next[key] === parseInt(cardId)) delete next[key];
        });
        return next;
      });
      return;
    }

    // Dropped on a Slot
    const slotId = over.id; // e.g., 'slot- -4-0'

    // Check if slot is occupied (unless swapping is implemented, let's keep it simple: overwrite or reject?)
    // Requirement says 1 statement per cell.
    // If we drop on an occupied slot, we could swap.

    setPlacements(prev => {
      const next = { ...prev };
      const occupiedCardId = next[slotId];

      // Remove card from old slot if it was placed somewhere
      let oldSlot = null;
      Object.keys(next).forEach(key => {
        if (next[key] === parseInt(cardId)) {
          oldSlot = key;
          delete next[key];
        }
      });

      // Place new card
      next[slotId] = parseInt(cardId);

      // If swapped, move occupiedCardId to oldSlot or back to deck
      if (occupiedCardId) {
        if (oldSlot) {
          next[oldSlot] = occupiedCardId; // Swap
        } else {
          // No old slot (came from deck), so occupied goes to deck (effectively removed from placements)
        }
      }

      return next;
    });
  };

  // Helper to get active card data for Overlay
  const activeCard = items.find(i => i.id === parseInt(activeId));

  // Render Logic
  const renderColumns = () => {
    const scores = Object.keys(distribution).map(Number).sort((a, b) => a - b);

    return scores.map(score => {
      const count = distribution[score];
      return (
        <Column key={score}>
          <ColumnHeader $score={score}>{score > 0 ? `+${score}` : info_score(score)}</ColumnHeader>
          {Array.from({ length: count }).map((_, idx) => {
            const slotId = `slot-${score}-${idx}`;
            const cardId = placements[slotId];
            const card = items.find(i => i.id === cardId);
            return (
              <DropZone
                key={slotId}
                id={slotId}
                score={score}
                currentCard={card}
              />
            );
          })}
        </Column>
      );
    });
  };

  const info_score = (s) => s; // helper

  // Remaining items
  const placedIds = Object.values(placements);
  const remainingItems = items.filter(i => !placedIds.includes(i.id));

  // Determine completion
  const isComplete = items.length > 0 && placedIds.length === items.length;

  useEffect(() => {
    if (onComplete) onComplete(placements, isComplete);
  }, [placements, isComplete]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <BoardContainer>
        <PyramidContainer>
          {renderColumns()}
        </PyramidContainer>

        {/* Deck as a Droppable area allows returning strings */}
        <DeckContainerWrapper id="deck">
          <DeckTitle>Remaining Statements ({remainingItems.length})</DeckTitle>

          {/* Group remaining items by category */}
          {Object.entries(remainingItems.reduce((acc, item) => {
            const cat = item.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
          }, {})).map(([category, items]) => (
            <CategoryGroup key={category}>
              <CategoryTitle>{category}</CategoryTitle>
              <CardsList>
                {items.map(item => (
                  <DraggableCard key={item.id} id={item.id} text={item.text} />
                ))}
              </CardsList>
            </CategoryGroup>
          ))}
        </DeckContainerWrapper>
      </BoardContainer>

      <DragOverlay className="drag-overlay">
        {activeId ? <DraggableCard id={activeId} text={activeCard?.text} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

// Wrapper for Deck to be droppable
import { useDroppable } from '@dnd-kit/core';
const DeckContainerWrapper = ({ children, id }) => {
  const { setNodeRef } = useDroppable({ id });
  return <DeckContainer ref={setNodeRef}>{children}</DeckContainer>;
}

export default QSortBoard;
