import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DndContext, DragOverlay, pointerWithin, useSensor, useSensors, PointerSensor, TouchSensor, useDroppable } from '@dnd-kit/core';
import styled from 'styled-components';
import DraggableCard, { CardView } from './DraggableCard';
import DropZone, { SLOT_WIDTH } from './DropZone';
import { SCORES } from '../experiments';
import { slotId } from '../utils/placements';

const BoardContainer = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-4);

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }
`;

const ScaledWrapper = styled.div`
  min-width: 0;
  min-height: 0;
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
  min-height: 2.6em;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  text-align: center;
  font-size: calc(var(--font-sm) * 2);
  font-weight: 600;
  line-height: 1.3;
  color: ${({ $score }) => ($score < 0 ? 'var(--disagree)' : 'var(--agree)')};
`;

const ColumnHeader = styled.div`
  font-size: calc(var(--font-md) * 2);
  line-height: 1.2;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ $score }) => ($score < 0 ? 'var(--disagree)' : $score > 0 ? 'var(--agree)' : 'var(--text-muted)')};
`;

const Deck = styled.aside`
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid ${({ $isOver }) => ($isOver ? 'var(--accent)' : 'var(--border)')};
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const DeckTitle = styled.h2`
  flex: none;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
  font-size: var(--font-md);
  font-weight: 700;
`;

const DeckList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
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

const CardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const DeckDropArea = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'deck' });
  return <Deck ref={setNodeRef} $isOver={isOver}>{children}</Deck>;
};

const NARROW_QUERY = '(max-width: 768px)';

// Scales the pyramid down so it fits its area without scrolling. On narrow screens the
// pyramid sits above the deck, so it fits the width and gives the remaining height to the deck.
const useFitScale = () => {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, height: undefined });

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return undefined;

    const narrow = window.matchMedia(NARROW_QUERY);
    const measure = () => {
      const byWidth = wrapper.clientWidth / content.offsetWidth;
      if (narrow.matches) {
        const scale = Math.min(1, byWidth);
        setFit({ scale, height: content.offsetHeight * scale });
      } else {
        setFit({ scale: Math.min(1, byWidth, wrapper.clientHeight / content.offsetHeight), height: undefined });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    observer.observe(content);
    narrow.addEventListener('change', measure);
    return () => {
      observer.disconnect();
      narrow.removeEventListener('change', measure);
    };
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
          <DeckList>
            {remainingByCategory.map(([category, items]) => (
              <CategoryGroup key={category}>
                {category && <CategoryTitle>{category}</CategoryTitle>}
                <CardsList>
                  {items.map((item) => (
                    <DraggableCard key={item.id} id={item.id} text={item.text} />
                  ))}
                </CardsList>
              </CategoryGroup>
            ))}
          </DeckList>
        </DeckDropArea>
      </BoardContainer>

      <DragOverlay className="drag-overlay" dropAnimation={null}>
        {activeCard && <CardView id={activeCard.id} text={activeCard.text} overlay style={{ width: 288 }} />}
      </DragOverlay>
    </DndContext>
  );
};

export default QSortBoard;
