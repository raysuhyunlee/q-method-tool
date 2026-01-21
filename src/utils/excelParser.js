import * as XLSX from 'xlsx';

export const parseExcel = async (url) => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });

    // Assuming first sheet contains statements
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Assuming first row is header, and remaining rows have statements
    // We expect a format like: [ID, Statement] or just list of statements.
    // For now, let's treat every non-empty row as a statement.
    // We'll normalize to { id: number, text: string }

    const statements = jsonData
      .filter(row => row && row.length > 0)
      .slice(1) // Skip header
      .map((row, index) => {
        // If row has multiple columns, assume col 0 is ID, col 1 is Text.
        // If row has 1 column, it is Text.
        let text = '';
        let id = index + 1;

        if (row.length >= 2) {
          // Check if col 0 looks like an ID
          if (!isNaN(parseInt(row[0]))) {
            id = parseInt(row[0]);
            text = row[1];
          } else {
            text = row[0]; // Fallback
          }
        } else {
          text = row[0];
        }

        return { id, text };
      });

    return statements || [];
  } catch (error) {
    console.error("Error parsing Excel:", error);
    return [];
  }
};
