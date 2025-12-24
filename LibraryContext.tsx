import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Book, Referral, Note, Role, ToastState } from '../types';
import { MOCK_USERS, INITIAL_BOOKS, MOCK_REFERRALS } from '../constants';

interface LibraryContextType {
  user: User | null;
  users: User[];
  books: Book[];
  referrals: Referral[];
  note: Note;
  toasts: ToastState[];
  login: (id: string, password?: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  removeUser: (id: string) => void;
  addBook: (book: Book) => void;
  updateBook: (book: Book) => void;
  removeBook: (id: string) => void;
  addReferral: (referral: Omit<Referral, 'id' | 'createdAt'>) => void;
  updateReferral: (referral: Referral) => void;
  removeReferral: (id: string) => void;
  updateNote: (content: string) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  toggleSavedBook: (bookId: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('lms_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('lms_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem('lms_referrals');
    return saved ? JSON.parse(saved) : MOCK_REFERRALS;
  });

  const [note, setNote] = useState<Note>(() => {
    const saved = localStorage.getItem('lms_jot');
    return saved ? JSON.parse(saved) : { content: '', lastUpdated: Date.now() };
  });

  useEffect(() => localStorage.setItem('lms_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('lms_books', JSON.stringify(books)), [books]);
  useEffect(() => localStorage.setItem('lms_referrals', JSON.stringify(referrals)), [referrals]);
  useEffect(() => localStorage.setItem('lms_jot', JSON.stringify(note)), [note]);

  useEffect(() => {
    setUsers(currentUsers => {
      let hasChanges = false;
      let newUsers = [...currentUsers];

      MOCK_USERS.forEach(mock => {
         if (!newUsers.some(u => u.id === mock.id)) {
             newUsers.push(mock);
             hasChanges = true;
         }
      });
      newUsers = newUsers.map(u => {
        const mock = MOCK_USERS.find(m => m.id === u.id);
        if (mock && mock.password && u.password !== mock.password) {
          hasChanges = true;
          return { ...u, password: mock.password };
        }
        return u;
      });

      return hasChanges ? newUsers : currentUsers;
    });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);


  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const login = (id: string, password?: string) => {
    const foundUser = users.find((u) => u.id === id);
    if (foundUser) {
      if (foundUser.password && foundUser.password !== password) {
         showToast('Invalid credentials', 'error');
         return false;
      }
      setUser(foundUser);
      showToast(`Welcome back, ${foundUser.name}`);
      return true;
    }
    showToast('Invalid ID or User not found', 'error');
    return false;
  };

  const logout = () => {
    setUser(null);
    showToast('Logged out successfully');
  };

  const addUser = (newUser: User) => {
    if (users.some(u => u.id === newUser.id)) {
      showToast('User ID already exists', 'error');
      return;
    }
    setUsers(prev => [...prev, newUser]);
    showToast(`User ${newUser.name} added successfully`);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    
    if (user && user.id === updatedUser.id) {
        setUser(updatedUser);
    }
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter((u) => u.id !== id));
    showToast('User removed');
  };

  const addBook = (newBook: Book) => {
    if (books.some(b => b.id === newBook.id)) {
      showToast('Book Access No/ID already exists', 'error');
      return;
    }
    setBooks(prev => [...prev, newBook]);
    showToast(`Book "${newBook.title}" added`);
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    showToast(`Book "${updatedBook.title}" updated`);
  };

  const removeBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    showToast('Book removed from inventory');
  };

  const addReferral = (refData: Omit<Referral, 'id' | 'createdAt'>) => {
    const newReferral: Referral = {
      ...refData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    setReferrals(prev => [...prev, newReferral]);
    showToast('Book referred successfully');
  };

  const updateReferral = (updatedReferral: Referral) => {
    setReferrals(prev => prev.map(r => r.id === updatedReferral.id ? updatedReferral : r));
    showToast('Referral details updated');
  };

  const removeReferral = (id: string) => {
    setReferrals(prev => prev.filter(r => r.id !== id));
    showToast('Referral removed');
  };

  const updateNote = (content: string) => {
    setNote({ content, lastUpdated: Date.now() });
  };

  const toggleSavedBook = (bookId: string) => {
    if (!user) return;
    const currentSaved = user.savedBookIds || [];
    let newSaved;
    let message = '';
    
    if (currentSaved.includes(bookId)) {
        newSaved = currentSaved.filter(id => id !== bookId);
        message = 'Removed from Saved Books';
    } else {
        newSaved = [...currentSaved, bookId];
        message = 'Added to Saved Books';
    }

    const updatedUser = { ...user, savedBookIds: newSaved };
    updateUser(updatedUser); 
    showToast(message);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <LibraryContext.Provider
      value={{
        user,
        users,
        books,
        referrals,
        note,
        toasts,
        login,
        logout,
        addUser,
        updateUser,
        removeUser,
        addBook,
        updateBook,
        removeBook,
        addReferral,
        updateReferral,
        removeReferral,
        updateNote,
        showToast,
        toggleSavedBook,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};