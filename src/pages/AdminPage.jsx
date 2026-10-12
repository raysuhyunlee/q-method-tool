import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { experimentList, getExperiment, getStatements } from '../experiments';
import { Alert, Button, PageTitle } from '../components/ui';

const Container = styled.div`
  padding: var(--space-6) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
`;

const Spacer = styled.div`
  flex: 1;
`;

const Select = styled.select`
  height: var(--control-height);
  padding: 0 var(--space-3);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-weight: 600;
`;

const Segmented = styled.div`
  display: flex;
  padding: 2px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
`;

const Segment = styled.button`
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: ${({ $active }) => ($active ? 'var(--surface)' : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? 'var(--shadow-sm)' : 'none')};
  color: ${({ $active }) => ($active ? 'var(--text)' : 'var(--text-muted)')};
  font-size: var(--font-sm);
  font-weight: 600;
  cursor: pointer;
`;

const TableWrapper = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: auto;
  max-height: calc(100vh - 160px);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-sm);
  font-variant-numeric: tabular-nums;
`;

const Th = styled.th`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: var(--space-2) var(--space-3);
  background: var(--surface-muted);
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:hover {
    background: var(--surface-muted);
  }
`;

const StatusBadge = styled.span`
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  background: ${({ $done }) => ($done ? 'var(--success-soft)' : 'var(--surface-muted)')};
  color: ${({ $done }) => ($done ? 'var(--success)' : 'var(--text-muted)')};
  font-weight: 600;
`;

const DeleteButton = styled.button`
  padding: var(--space-1) var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--danger);
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--danger-soft);
  }
`;

const Empty = styled.p`
  padding: var(--space-7);
  text-align: center;
  color: var(--text-muted);
`;

const FILTERS = [
  { id: 'completed', label: 'Completed' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'all', label: 'All' },
];

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '');

const AdminPage = () => {
  const { experimentId } = useParams();
  const navigate = useNavigate();
  const experiment = getExperiment(experimentId);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('completed');
  const [exporting, setExporting] = useState(false);

  const fetchResults = useCallback(async (signal) => {
    setRows(null);
    setError(null);
    try {
      const response = await fetch(`/api/get-results?experiment=${encodeURIComponent(experimentId)}`, { signal });
      const json = await response.json();
      if (!json.success) throw new Error(json.error);
      setRows(json.data.map((row) => ({
        ...row,
        results: typeof row.results === 'string' ? JSON.parse(row.results) : (row.results ?? {}),
      })));
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Fetch error:', err);
      setError('Results could not be loaded. Refresh the page to try again.');
    }
  }, [experimentId]);

  useEffect(() => {
    if (!experiment) return undefined;
    const controller = new AbortController();
    fetchResults(controller.signal);
    return () => controller.abort();
  }, [experiment, fetchResults]);

  const statementIds = useMemo(
    () => (experiment ? getStatements(experiment, 'ko').map((s) => s.id).sort((a, b) => a - b) : []),
    [experiment]
  );

  const counts = useMemo(() => {
    const c = { completed: 0, in_progress: 0, all: rows?.length ?? 0 };
    rows?.forEach((row) => { c[row.status] = (c[row.status] ?? 0) + 1; });
    return c;
  }, [rows]);

  const visibleRows = useMemo(
    () => (rows ?? []).filter((row) => filter === 'all' || row.status === filter),
    [rows, filter]
  );

  if (!experiment) return <Navigate to="/admin" replace />;

  const deleteRecord = async (id) => {
    if (!confirm(`Delete record #${id}? This can't be undone.`)) return;
    try {
      const response = await fetch(`/api/delete-result?id=${id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!json.success) throw new Error(json.error);
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Record #${id} could not be deleted. Refresh the page and try again.`);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import('xlsx');
      const sheetRows = visibleRows.map((row) => {
        const excelRow = {
          ID: row.id,
          Status: row.status,
          Name: row.name,
          Age: row.age,
          Gender: row.gender,
          Preference: row.preference,
          Locale: row.locale,
          'Created At': formatDate(row.created_at),
          'Updated At': formatDate(row.updated_at),
        };
        statementIds.forEach((id) => {
          excelRow[`Q${id}`] = row.results[id] ?? '';
        });
        return excelRow;
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetRows), 'Results');
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `q-method_${experiment.id}_${filter}_${date}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Container>
      <Toolbar>
        <PageTitle as="h1">Results</PageTitle>
        <Select
          aria-label="Experiment"
          value={experiment.id}
          onChange={(e) => navigate(`/admin/${e.target.value}`)}
        >
          {experimentList.map((exp) => (
            <option key={exp.id} value={exp.id}>{exp.title.ko}</option>
          ))}
        </Select>
        <Segmented role="group" aria-label="Status">
          {FILTERS.map((f) => (
            <Segment key={f.id} $active={filter === f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label} {rows ? counts[f.id] ?? 0 : ''}
            </Segment>
          ))}
        </Segmented>
        <Spacer />
        <Button onClick={exportToExcel} disabled={!rows || visibleRows.length === 0 || exporting}>
          {exporting ? 'Exporting…' : `Export ${visibleRows.length} to Excel`}
        </Button>
      </Toolbar>

      {error && <Alert role="alert">{error}</Alert>}

      {!error && (
        <TableWrapper>
          {rows === null ? (
            <Empty>Loading…</Empty>
          ) : visibleRows.length === 0 ? (
            <Empty>No records.</Empty>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Status</Th>
                  <Th>Name</Th>
                  <Th>Age</Th>
                  <Th>Gender</Th>
                  <Th>Preference</Th>
                  <Th>Locale</Th>
                  <Th>Created</Th>
                  <Th>Updated</Th>
                  {statementIds.map((id) => <Th key={id}>Q{id}</Th>)}
                  <Th />
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.id}</Td>
                    <Td>
                      <StatusBadge $done={row.status === 'completed'}>
                        {row.status === 'completed' ? 'Completed' : 'In progress'}
                      </StatusBadge>
                    </Td>
                    <Td>{row.name}</Td>
                    <Td>{row.age}</Td>
                    <Td>{row.gender}</Td>
                    <Td>{row.preference}</Td>
                    <Td>{row.locale}</Td>
                    <Td>{formatDate(row.created_at)}</Td>
                    <Td>{formatDate(row.updated_at)}</Td>
                    {statementIds.map((id) => <Td key={id}>{row.results[id] ?? ''}</Td>)}
                    <Td>
                      <DeleteButton onClick={() => deleteRecord(row.id)}>Delete</DeleteButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </TableWrapper>
      )}
    </Container>
  );
};

export default AdminPage;
