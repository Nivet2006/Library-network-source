export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  LIBRARIAN = 'LIBRARIAN'
}

export enum Branch {
  CSE = 'CSE',
  ME = 'ME',
  CIVIL = 'CIVIL',
  AERO = 'AERO',
  ECE = 'ECE',
  ISE = 'ISE'
}

export interface User {
  id: string;
  name: string;
  role: Role;
  branch?: Branch;
  semester?: number;
  year?: number;
  email?: string;
  phoneNumber?: string;
  password?: string;
  savedBookIds?: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  department?: Branch;
  isbn?: string;
  publisher?: string;
  edition?: string;
  price?: number;
  stock: number;
}

export interface Referral {
  id: string;
  bookId: string;
  teacherId: string;
  targetBranch: Branch;
  targetSemester: number;
  createdAt: number;
}

export interface Note {
  content: string;
  lastUpdated: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  };
  channelId: string;
  timestamp: number;
}

export interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}