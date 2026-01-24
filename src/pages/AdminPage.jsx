import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';

const Container = styled.div`
  padding: 40px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin: 0;
`;

const ExportButton = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const Th = styled.th`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
  font-size: 0.85rem;
`;

const Td = styled.td`
  padding: 10px 8px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8fafc;
  }
`;

const Loading = styled.div`
  color: white;
  font-size: 1.5rem;
  text-align: center;
  margin-top: 100px;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 1.1rem;
`;

const AdminPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/get-results');
      const json = await response.json();

      if (json.success) {
        setData(json.data);
      } else {
        setError('Failed to fetch results');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (data.length === 0) return;

    // Get all unique statement IDs from all results
    const allStatementIds = new Set();
    data.forEach(row => {
      const results = typeof row.results === 'string' ? JSON.parse(row.results) : row.results;
      Object.keys(results).forEach(id => allStatementIds.add(parseInt(id)));
    });
    const sortedIds = Array.from(allStatementIds).sort((a, b) => a - b);

    // Prepare data for Excel
    const excelData = data.map(row => {
      const results = typeof row.results === 'string' ? JSON.parse(row.results) : row.results;

      // Create base row
      const excelRow = {
        'ID': row.id,
        'Name': row.name,
        'Age': row.age,
        'Gender': row.gender,
        'K-pop Preference': row.kpop_preference,
        'Locale': row.locale,
        'Created At': new Date(row.created_at).toLocaleString()
      };

      // Add all statement scores dynamically
      sortedIds.forEach(statementId => {
        excelRow[`Q${statementId}`] = results[statementId.toString()] ?? '';
      });

      return excelRow;
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Q-Method Results');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `q-method-results_${timestamp}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
  };

  if (loading) return <Container><Loading>Loading results...</Loading></Container>;
  if (error) return <Container><ErrorMessage>{error}</ErrorMessage></Container>;

  // Get all unique statement IDs from all results
  const statementIds = new Set();
  data.forEach(row => {
    const results = typeof row.results === 'string' ? JSON.parse(row.results) : row.results;
    Object.keys(results).forEach(id => statementIds.add(parseInt(id)));
  });
  const sortedStatementIds = Array.from(statementIds).sort((a, b) => a - b);

  return (
    <Container>
      <Header>
        <Title>Q-Method Results Admin</Title>
        <ExportButton onClick={exportToExcel} disabled={data.length === 0}>
          Export to Excel ({data.length} records)
        </ExportButton>
      </Header>

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Age</Th>
              <Th>Gender</Th>
              <Th>K-pop</Th>
              <Th>Locale</Th>
              <Th>Created At</Th>
              {sortedStatementIds.map(id => (
                <Th key={id}>Q{id}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => {
              const results = typeof row.results === 'string' ? JSON.parse(row.results) : row.results;
              return (
                <Tr key={row.id}>
                  <Td>{row.id}</Td>
                  <Td>{row.name}</Td>
                  <Td>{row.age}</Td>
                  <Td>{row.gender}</Td>
                  <Td>{row.kpop_preference}</Td>
                  <Td>{row.locale}</Td>
                  <Td>{new Date(row.created_at).toLocaleString()}</Td>
                  {sortedStatementIds.map(id => (
                    <Td key={id}>{results[id.toString()] ?? ''}</Td>
                  ))}
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrapper>
    </Container>
  );
};

export default AdminPage;
