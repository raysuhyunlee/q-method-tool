import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { experimentList } from '../experiments';
import { Panel, PageTitle } from '../components/ui';

const Container = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: var(--space-7) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;

const List = styled(Panel)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Item = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  color: var(--text);
  text-decoration: none;
  font-weight: 600;

  & + & {
    border-top: 1px solid var(--border);
  }

  &:hover {
    background: var(--surface-muted);
  }

  &::after {
    content: '›';
    color: var(--text-muted);
    font-size: var(--font-lg);
  }
`;

const ExperimentIndex = () => (
  <Container>
    <PageTitle>Q-Sort</PageTitle>
    <List>
      {experimentList.map((experiment) => (
        <Item key={experiment.id} to={`/${experiment.id}`}>
          {experiment.title.ko}
        </Item>
      ))}
    </List>
  </Container>
);

export default ExperimentIndex;
