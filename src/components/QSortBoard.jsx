import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DndContext, DragOverlay, pointerWithin, useSensor, useSensors, PointerSensor, TouchSensor, useDroppable } from '@dnd-kit/core';
import styled from 'styled-components';
import DraggableCard, { CardView } from './DraggableCard';
import DropZone, { SLOT_WIDTH } from './DropZone';
import { SCORES } from '../experiments';
import { slotId } from '../utils/placements';

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: var(--space-6);
`;

const ScaledWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  overflow: hidden;
`;

const PyramidContent = styled.div`
  display: flex;
  gap: var(--space-2);
  width: max-content;
  height: max-content;
  transform-origin: top center;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
`;

const ExtremeLabel = styled.div`
  width: ${SLOT_WIDTH}px;
  min-height: 2.8em;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  text-align: center;
  font-size: var(--font-sm);
  font-weight: 600;
  line-height: 1.3;
  color: ${({ $score }) => ($score < 0 ? 'var(--disagree)' : 'var(--agree)')};
`;

const ColumnHeader = styled.div`
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ $score }) => ($score < 0 ? 'var(--disagree)' : $score > 0 ? 'var(--agree)' : 'var(--text-muted)')};
`;

const Deck = styled.div`
  width: 100%;
  padding: var(--space-5);
  background: var(--surface);
  border: 1px solid ${({ $isOver }) => ($isOver ? 'var(--accent)' : 'var(--border)')};
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-height: 120px;

  @media (max-width: 480px) {
    padding: var(--space-4);
  }
`;

const DeckTitle = styled.h2`
  font-size: var(--font-md);
  font-weight: 700;
`;

const Count = styled.span`
  margin-left: var(--space-2);
  color: var(--text-muted);
  font-weight: 600;
`;

const CategoryGroup = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const CategoryTitle = styled.h3`
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-muted);
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-2);
`;

const DeckDropArea = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'deck' });
  return <Deck ref={setNodeRef} $isOver={isOver}>{children}</Deck>;
};

// Scales the pyramid down to fit the viewport width and keeps the wrapper height in sync.
const useFitScale = () => {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, height: undefined });

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return undefined;

    const measure = () => {
      const scale = Math.min(1, wrapper.clientWidth / content.offsetWidth);
      setFit({ scale, height: content.offsetHeight * scale });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return { wrapperRef, contentRef, ...fit };
};

const QSortBoard = ({ statements, distribution, placements, onChange }) => {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState(null);
  const { wrapperRef, contentRef, scale, height } = useFitScale();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const statementsById = useMemo(() => new Map(statements.map((s) => [s.id, s])), [statements]);

  const remainingByCategory = useMemo(() => {
    const placed = new Set(Object.values(placements));
    const groups = new Map();
    statements.forEach((s) => {
      if (placed.has(s.id)) return;
      const key = s.category || '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(s);
    });
    return [...groups.entries()];
  }, [statements, placements]);

  const remainingCount = statements.length - Object.keys(placements).length;

  const handleDragStart = (event) => setActiveId(event.active.data.current.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const cardId = active.data.current.id;
    const next = { ...placements };
    const fromSlot = Object.keys(next).find((key) => next[key] === cardId);
    if (fromSlot) delete next[fromSlot];

    if (over.id !== 'deck') {
      const displaced = placements[over.id];
      next[over.id] = cardId;
      // Swap when moving between occupied slots; a card displaced by one from the deck returns to the deck.
      if (displaced !== undefined && displaced !== cardId && fromSlot) next[fromSlot] = displaced;
    }

    if (fromSlot === over.id) return;
    if (!fromSlot && over.id === 'deck') return;
    onChange(next);
  };

  const activeCard = activeId != null ? statementsById.get(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <BoardContainer>
        <ScaledWrapper ref={wrapperRef} style={{ height }}>
          <PyramidContent ref={contentRef} style={{ transform: `scale(${scale})` }}>
            {SCORES.map((score, column) => (
              <Column key={score}>
                <ExtremeLabel $score={score}>
                  {column === 0 && t('sort.stronglyDisagree')}
                  {column === SCORES.length - 1 && t('sort.stronglyAgree')}
                </ExtremeLabel>
                <ColumnHeader $score={score}>{score > 0 ? `+${score}` : score}</ColumnHeader>
                {Array.from({ length: distribution[column] }, (_, index) => {
                  const id = slotId(score, index);
                  return <DropZone key={id} id={id} currentCard={statementsById.get(placements[id])} />;
                })}
              </Column>
            ))}
          </PyramidContent>
        </ScaledWrapper>

        <DeckDropArea>
          <DeckTitle>
            {t('sort.remaining_statements')}
            <Count>{remainingCount}</Count>
          </DeckTitle>
          {remainingByCategory.map(([category, items]) => (
            <CategoryGroup key={category}>
              {category && <CategoryTitle>{category}</CategoryTitle>}
              <CardsGrid>
                {items.map((item) => (
                  <DraggableCard key={item.id} id={item.id} text={item.text} />
                ))}
              </CardsGrid>
            </CategoryGroup>
          ))}
        </DeckDropArea>
      </BoardContainer>

      <DragOverlay className="drag-overlay" dropAnimation={null}>
        {activeCard && <CardView id={activeCard.id} text={activeCard.text} overlay style={{ width: 260 }} />}
      </DragOverlay>
    </DndContext>
  );
};

export default QSortBoard;
