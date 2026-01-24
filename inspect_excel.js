import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'Q-Method_Statement.xlsx');
console.log('Reading file:', filePath);

if (!fs.existsSync(filePath)) {
  console.error('File not found!');
  process.exit(1);
}

const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Headers (Row 0):', data[0]);
console.log('First Row (Row 1):', data[1]);
console.log('Second Row (Row 2):', data[2]);
