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

    // We expect headers: Category, No., Statement, Sentiment (optional)
    // Row structure: [Category, No, Statement, ...]

    let lastCategory = '';

    const statements = jsonData
      .slice(1) // Skip header
      .map((row, index) => {
        // Row might be shorter than headers if cells are empty
        // We need to handle index access carefully
        const categoryCell = row[0];
        const noCell = row[1];
        const statementCell = row[2];


        // Forward fill category
        if (categoryCell) {
          lastCategory = categoryCell.trim();
        }

        let id = index + 1;
        if (noCell && !isNaN(parseInt(noCell))) {
          id = parseInt(noCell);
        }

        let text = statementCell || '';
        // Fallback if structure is different (e.g. user uploaded old format)
        if (!text && row.length > 0) {
          // Try to find text in other columns if expected column is empty 
          // but this is risky. Let's stick to the plan.
          // If the file is strictly following the template, keeping it simple is better.
        }

        return {
          id,
          text,
          category: lastCategory
        };
      })
      .filter(item => item.text); // Filter out empty rows if any

    return statements || [];
  } catch (error) {
    console.error("Error parsing Excel:", error);
    return [];
  }
};
