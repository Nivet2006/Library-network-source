import React, { useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { Book, Referral } from '../types';
import { Bookmark, Library, UserCheck } from 'lucide-react';

export const StudentPanel: React.FC = () => {
  const { user, users, books, referrals, toggleSavedBook } = useLibrary();

  const { recommendedBooks, otherBooks } = useMemo(() => {
    if (!user || user.role !== 'STUDENT') return { recommendedBooks: [], otherBooks: books };

    const myReferrals = referrals.filter(
        r => r.targetBranch === user.branch && r.targetSemester === user.semester
    );
    const referredBookIds = new Set(myReferrals.map(r => r.bookId));

    const recs: Book[] = [];
    const others: Book[] = [];

    books.forEach(book => {
        if (referredBookIds.has(book.id)) {
            recs.push(book);
        } else {
            others.push(book);
        }
    });

    return { recommendedBooks: recs, otherBooks: others };
  }, [user, books, referrals]);

  const BookCard: React.FC<{ book: Book, isRecommended?: boolean }> = ({ book, isRecommended }) => {
    const isSaved = user?.savedBookIds?.includes(book.id);

    const referrerNames = useMemo(() => {
        if (!isRecommended || !user) return null;
        
        const relevantReferrals = referrals.filter(r => 
            r.bookId === book.id && 
            r.targetBranch === user.branch && 
            r.targetSemester === user.semester
        );

        if (relevantReferrals.length === 0) return null;

        const uniqueTeacherIds = Array.from(new Set(relevantReferrals.map(r => r.teacherId)));
        
        const names = uniqueTeacherIds.map(tid => {
            const teacher = users.find(u => u.id === tid);
            return teacher ? teacher.name : tid;
        });

        return names.join(', ');
    }, [book.id, isRecommended, user, referrals, users]);

    return (
        <div 
            onClick={() => toggleSavedBook(book.id)}
            className={`
            relative p-6 border transition-all duration-300 group cursor-pointer hover:shadow-xl hover:scale-[1.01] flex flex-col justify-between
            ${isRecommended 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent shadow-lg' 
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white'
            }
        `}>
            {isRecommended && (
                <div className="absolute -top-3 -left-3 bg-blue-600 text-white p-2 rounded-full shadow-lg z-10" title="Recommended by Teacher">
                    <Bookmark size={16} fill="currentColor" />
                </div>
            )}

            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    toggleSavedBook(book.id);
                }}
                className={`
                    absolute top-4 right-4 p-2 rounded-full transition-all z-20
                    ${isRecommended
                        ? 'text-zinc-300 hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-black/10'
                        : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }
                `}
                title={isSaved ? "Remove from Saved" : "Save for Later"}
            >
                <Bookmark 
                    size={20} 
                    fill={isSaved ? "currentColor" : "none"} 
                    className={isSaved ? (isRecommended ? "text-white dark:text-black" : "text-black dark:text-white") : ""}
                />
            </button>
            
            <div className="flex-1">
                <span className={`text-[10px] uppercase font-bold tracking-widest ${isRecommended ? 'opacity-60' : 'text-zinc-400'}`}>
                    {book.category}
                </span>
                <h3 className="text-xl font-bold mt-2 leading-tight pr-8">{book.title}</h3>
                <p className={`text-sm mt-1 ${isRecommended ? 'opacity-80' : 'text-zinc-500'}`}>by {book.author}</p>
                
                {/* Referrer Info Display */}
                {referrerNames && (
                    <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded w-fit
                        ${isRecommended 
                            ? 'bg-white/10 text-blue-200 dark:text-blue-600 dark:bg-black/5' 
                            : 'bg-zinc-100 text-zinc-600'
                        }
                    `}>
                        <UserCheck size={12} />
                        <span>Referred by {referrerNames}</span>
                    </div>
                )}
            </div>
            
            <div className={`mt-6 pt-4 border-t border-dashed ${isRecommended ? 'border-zinc-700 dark:border-zinc-300' : 'border-zinc-200 dark:border-zinc-800'}`}>
                <div className="flex justify-between items-center text-xs font-mono uppercase">
                    <span>Stock: {book.stock}</span>
                    <span className={book.stock > 0 ? (isRecommended ? 'text-green-400 dark:text-green-600' : 'text-green-600') : 'text-red-500'}>
                        {book.stock > 0 ? 'Available' : 'Unavailable'}
                    </span>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="border-b border-black dark:border-white pb-6">
        <h1 className="text-4xl font-light tracking-tighter">My Library</h1>
        <p className="text-zinc-500 mt-2">
            Welcome, <span className="font-semibold text-black dark:text-white">{user?.name}</span>. 
            Showing resources for <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{user?.branch} - Sem {user?.semester}</span>
        </p>
      </header>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bookmark className="text-blue-600" /> Recommended for You
        </h2>
        {recommendedBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedBooks.map(book => <BookCard key={book.id} book={book} isRecommended />)}
            </div>
        ) : (
            <div className="p-8 border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-500">
                No teacher referrals for your class yet.
            </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 opacity-50">
            <Library /> Books Inventory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherBooks.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      </section>
    </div>
  );
};