import { Book, Branch, Role, User, Referral } from './types';

export const INITIAL_BOOKS: Book[] = [//some demo books
  { id: 'ACC001', title: 'Fluid Mechanics', author: 'Frank M. White', category: 'Mechanics', department: Branch.ME, stock: 18 },
  { id: 'ACC028', title: 'Data and Computer Communications', author: 'William Stallings', category: 'Networking', department: Branch.CSE, isbn: '978-81-317-1536-9', publisher: 'Pearson Education', price: 435, stock: 23 },
  { id: 'ACC029', title: 'Interactive Computer Graphics', author: 'Edward Angel', category: 'Graphics', department: Branch.CSE, isbn: '978-81-317-9725-9', publisher: 'Pearson Education', price: 515, stock: 9 },
  { id: 'ACC030', title: 'Programming the World Wide Web', author: 'Robert W Sebesta', category: 'Web Dev', department: Branch.CSE, publisher: 'Pearson Education', price: 425, stock: 13 },
  { id: 'ACC031', title: 'Practical Object Oriented Design with UML', author: 'Mark Priestley', category: 'Design', department: Branch.CSE, publisher: 'Tata Mc Graw Hill', price: 315, stock: 14 }];

import { useState, useEffect } from 'react';
import { fetchBooksFromSheet } from './sheetService';

const BookLibrary = () => {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const googleSheetBooks = await fetchBooksFromSheet();
      setBooks(googleSheetBooks);
    };
    
    loadData();
  }, []);

  return ();
};

export const MOCK_USERS: User[] = [
  { id: 'LIB001', name: 'Admin Librarian', role: Role.LIBRARIAN, password: 'PASS1234' },
  { id: 'TEA001', name: 'Prof. Nithesh', role: Role.TEACHER, branch: Branch.CSE, password: 'PASS1234' },
  { id: '1CR19CS001', name: 'Nived Shaji', role: Role.STUDENT, branch: Branch.CSE, semester: 3, year: 2, email: 'nived@gcem.edu', password: 'PASS1234' },
  { id: '1CR19ME002', name: 'R Mazhar Abbas', role: Role.STUDENT, branch: Branch.ME, semester: 1, year: 1, email: 'rmaz@gcem.edu', password: 'PASS1234' },
];

export const MOCK_REFERRALS: Referral[] = [
  { id: 'r1', bookId: 'ACC007', teacherId: 'TEA001', targetBranch: Branch.CSE, targetSemester: 3, createdAt: Date.now() },
  { id: 'r2', bookId: 'ACC002', teacherId: 'TEA001', targetBranch: Branch.CSE, targetSemester: 3, createdAt: Date.now() },
];