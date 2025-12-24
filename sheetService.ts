import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Book, Branch } from './types';

const SHEET_ID = '1PJ_P0isAaqqVTuEJ1LirgGtiIGWG_dSj';
const WORKSHEET_TITLE = 'Computer Science Engineering';

const serviceAccountAuth = new JWT({
  email: nivedshaji.gcem@gmail.com,
  key: process.env.KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const fetchBooksFromSheet = async (): Promise<Book[]> => {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[WORKSHEET_TITLE];
    if (!sheet) {
      throw new Error(`Sheet "${WORKSHEET_TITLE}" not found.`);
    }

    const rows = await sheet.getRows();

    const books: Book[] = rows.map((row) => {
      const rawDept = row.get('Department');
      
      const department = mapBranch(rawDept);

      return {
        id: formatId(row.get('Access_No')), 
        
        title: row.get('Title') || 'Unknown Title',
        author: row.get('Authors') || 'Unknown Author',
        
        category: row.get('Subject') || 'General', 
        
        department: department,
        
        publisher: row.get('Publisher'),
        isbn: row.get('ISBN'),
        price: parseFloat(row.get('Price')) || 0,
        
        stock: 5, 
      };
    });

    return books;

  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return [];
  }
};

const formatId = (accessNo: any): string => {
  if (!accessNo) return `ACC${Math.floor(Math.random() * 1000)}`;
  const num = accessNo.toString().padStart(3, '0');
  return `ACC${num}`;
};

const mapBranch = (deptStr: string): Branch => {
  const normalized = deptStr?.toUpperCase().trim();
  switch (normalized) {
    case 'CSE': return Branch.CSE;
    case 'ME': return Branch.ME;
    case 'ECE': return Branch.ECE;
    case 'CIVIL': return Branch.CIVIL;
    case 'AERO': return Branch.AERO;
    default: return Branch.CSE; 
  }
};