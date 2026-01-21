import * as XLSX from 'xlsx';

export const exportData = (userData, qSortResults) => {
  // 1. Prepare data structure
  // Row 1: Headers (keys)
  // Row 2: Values

  // Flatten placements: { "slot-score-index": cardId } -> { cardId: score } mapping might be easier for analysis?
  // User asked for: "What score was given to which statement". 
  // Standard Q-format often lists Statements as rows and Participants as columns (for by-person factor analysis),
  // OR Participants as rows and Statements as columns.
  // Since this is a single-user session tool, we are creating ONE file per user? Or appending?
  // Web app client-side usually creates a new file.
  // Let's create a row for this user.

  // But wait, the user said "participants use the site and then save data as excel".
  // Client-side, we can only download a file. We can't append to a server file without a backend.
  // So we will download a file named "{User}_QSort_Data.xlsx".

  // Format:
  // Sheet 1: Metadata & Scores
  // Columns: Name, Age, Gender, Kpop, Statement_1_Score, Statement_2_Score, ...

  // First, revert placements to { cardId: score }
  const cardScores = {};
  Object.keys(qSortResults).forEach(key => {
    // key: slot-SCORE-INDEX
    const parts = key.split('-');
    // parts[0] = 'slot'
    // parts[1] = score (can be negative)
    // parts[2] = index

    const score = parseInt(parts[1]);
    const cardId = qSortResults[key];
    cardScores[cardId] = score;
  });

  // Create headers
  // Base headers
  const headers = ['Name', 'Age', 'Gender', 'K-pop Pref'];
  const values = [userData.name, userData.age, userData.gender, userData.kpopPreference];

  // Add statement columns. We assume card IDs are 1..N. We should find max ID or just iterate sorted keys.
  const cardIds = Object.keys(cardScores).map(Number).sort((a, b) => a - b);

  cardIds.forEach(id => {
    headers.push(`Statement_${id}`);
    values.push(cardScores[id]);
  });

  // Create worksheet
  const wsData = [headers, values];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");

  // Generate file name
  const fileName = `QSort_${userData.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  // trigger download
  XLSX.writeFile(wb, fileName);
};
