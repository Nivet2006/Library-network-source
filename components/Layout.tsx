import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { LogOut, BookOpen, Sun, Moon, Bookmark, X, Trash2, Search } from 'lucide-react';
import { SocialSidebar } from './SocialSidebar';
import { ToastContainer } from './ToastContainer';
import { Book } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, books, logout, darkMode, toggleDarkMode, toggleSavedBook } = useLibrary();
  const [isSavedOpen, setIsSavedOpen] = useState(false);

  const savedBooksList = React.useMemo(() => {
    if (!user || !user.savedBookIds) return [];
    return books.filter(b => user.savedBookIds?.includes(b.id));
  }, [user, books]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <nav className="border-b border-black dark:border-white sticky top-0 z-20 bg-paper/90 dark:bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tighter">Library Network</span>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                    {/* Visual search bar only as per screenshot, functionality can be added later */}
                    <input 
                        className="w-full bg-transparent border-2 border-blue-200/50 dark:border-blue-900/50 focus:border-blue-500 rounded-sm px-4 py-1.5 text-sm outline-none transition-colors"
                        placeholder="" 
                        readOnly 
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">

              {user && user.role === 'STUDENT' && (
                  <button 
                    onClick={() => setIsSavedOpen(true)}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors relative"
                    title="View Saved Books"
                  >
                    <Bookmark size={20} />
                    {savedBooksList.length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </button>
              )}

              <button 
                onClick={toggleDarkMode}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user && (
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-medium hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <SocialSidebar />
      <ToastContainer />

      {/* Saved Books Modal */}
      {isSavedOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-zinc-900 w-full max-w-lg border border-black dark:border-white shadow-2xl relative flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                          <Bookmark size={20} className="text-blue-600" fill="currentColor"/> Saved Books
                          <span className="text-sm font-normal text-zinc-500 ml-2">({savedBooksList.length})</span>
                      </h2>
                      <button 
                          onClick={() => setIsSavedOpen(false)}
                          className="text-zinc-400 hover:text-black dark:hover:text-white"
                      >
                          <X size={20} />
                      </button>
                  </div>

                  <div className="overflow-y-auto p-4 space-y-3">
                      {savedBooksList.length === 0 ? (
                          <div className="text-center py-10 text-zinc-500">
                              <p>You haven't saved any books yet.</p>
                              <p className="text-sm mt-1">Click the bookmark icon on any book to save it for later.</p>
                          </div>
                      ) : (
                          savedBooksList.map(book => (
                              <div key={book.id} className="flex justify-between items-start p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-white transition-colors group">
                                  <div>
                                      <h3 className="font-bold text-sm leading-tight">{book.title}</h3>
                                      <p className="text-xs text-zinc-500 mt-1">by {book.author}</p>
                                      <div className="mt-2 flex items-center gap-2">
                                          <span className="text-[10px] uppercase bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 px-1">{book.id}</span>
                                          <span className={`text-[10px] font-bold ${book.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                              {book.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                          </span>
                                      </div>
                                  </div>
                                  <button 
                                      onClick={() => toggleSavedBook(book.id)}
                                      className="text-zinc-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Remove from Saved"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
