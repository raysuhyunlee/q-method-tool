import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import QSortBoard from '../components/QSortBoard';
import { parseExcel } from '../utils/excelParser';
import { generateDistribution } from '../utils/distribution';
import styled from 'styled-components';

const PageContainer = styled.div`
  width: 100%;
  padding: 80px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  align-items: center;
  margin-bottom: 20px;
  color: white;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
`;

const Button = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  background: ${props => props.disabled ? '#475569' : 'var(--success-color)'};
  color: white;
  border: none;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }
`;

const Loading = styled.div`
  color: white;
  font-size: 1.2rem;
  margin-top: 50px;
`;

const SortPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const { prepResults } = useUser();

  const [statements, setStatements] = useState([]);
  const [distribution, setDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [currentPlacements, setCurrentPlacements] = useState({});

  useEffect(() => {
    const init = async () => {
      // In production/dev, file is at root of public
      const data = await parseExcel('/Q-Method_Statement.xlsx');
      setStatements(data);
      setDistribution(generateDistribution(data.length));
      setLoading(false);
    };
    init();
  }, []);

  const handleComplete = (placements, complete) => {
    setCurrentPlacements(placements);
    setIsComplete(complete);
  };

  const onFinish = () => {
    if (!isComplete) return;
    prepResults(currentPlacements);
    navigate(`/${lang}/finish`);
  };

  if (loading) return <Loading>Loading Q-Statements...</Loading>;
  if (statements.length === 0) return <Loading>No statements found or error loading file.</Loading>;

  return (
    <PageContainer>
      <Header>
        <Title>{t('sort.instruction')}</Title>
        <Button onClick={onFinish} disabled={!isComplete}>
          {t('sort.finish_button')}
        </Button>
      </Header>

      <QSortBoard
        statements={statements}
        distribution={distribution}
        onComplete={handleComplete}
      />
    </PageContainer>
  );
};

export default SortPage;
