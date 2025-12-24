import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { Book, Branch, Referral } from '../types';
import { BookOpenCheck, Search, X, Pencil, Trash2, BookMarked, Download, Filter, AlertTriangle, Check, ArrowLeft } from 'lucide-react';

export const TeacherPanel: React.FC = () => {
  const { books, referrals, addReferral, updateReferral, removeReferral, user, showToast } = useLibrary();
  const [activeTab, setActiveTab] = useState<'inventory' | 'referrals'>('inventory');

  const [inventorySearch, setInventorySearch] = useState('');

  const [referralSearch, setReferralSearch] = useState('');
  const [referralBranchFilter, setReferralBranchFilter] = useState<Branch | 'ALL'>('ALL');
  const [referralSemFilter, setReferralSemFilter] = useState<number | 'ALL'>('ALL');
  const [selectedReferralIds, setSelectedReferralIds] = useState<Set<string>>(new Set());

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [targetBranch, setTargetBranch] = useState<Branch>(Branch.CSE);
  const [targetSem, setTargetSem] = useState<number>(1);
  const [isConfirming, setIsConfirming] = useState(false);

  const filteredInventory = books.filter(b => 
    b.title.toLowerCase().includes(inventorySearch.toLowerCase()) || 
    b.author.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const myReferrals = referrals.filter(r => r.teacherId === user?.id);
  
  const filteredReferrals = useMemo(() => {
    return myReferrals.filter(r => {
        const book = books.find(b => b.id === r.bookId);
        const matchesSearch = book 
            ? book.title.toLowerCase().includes(referralSearch.toLowerCase())
            : false;
        const matchesBranch = referralBranchFilter === 'ALL' || r.targetBranch === referralBranchFilter;
        const matchesSem = referralSemFilter === 'ALL' || r.targetSemester === referralSemFilter;

        return matchesSearch && matchesBranch && matchesSem;
    });
  }, [myReferrals, books, referralSearch, referralBranchFilter, referralSemFilter]);

  
  const handleOpenReferralModal = (book: Book) => {
      if (book.stock <= 0) {
          showToast(`"${book.title}" is currently out of stock and cannot be referred.`, 'error');
          return;
      }
      setSelectedBook(book);
      setEditingReferral(null);
      setTargetBranch(Branch.CSE);
      setTargetSem(1);
      setIsConfirming(false);
  };

  const handleEditReferral = (referral: Referral) => {
      const book = books.find(b => b.id === referral.bookId);
      if (book) {
          setSelectedBook(book);
          setEditingReferral(referral);
          setTargetBranch(referral.targetBranch);
          setTargetSem(referral.targetSemester);
          setIsConfirming(false);
      }
  };

  const handleDeleteReferral = (e: React.MouseEvent, id: string) => {
      e.stopPropagation(); 
      removeReferral(id);
      const newSet = new Set(selectedReferralIds);
      if (newSet.delete(id)) setSelectedReferralIds(newSet);
  };

  const handleReviewReferral = () => {
      setIsConfirming(true);
  };

  const handleSaveReferral = () => {
    if (selectedBook && user) {
        if (editingReferral) {
            updateReferral({
                ...editingReferral,
                targetBranch,
                targetSemester: targetSem
            });
        } else {
            addReferral({
                bookId: selectedBook.id,
                teacherId: user.id,
                targetBranch,
                targetSemester: targetSem
            });
        }
        closeModal();
    }
  };

  const closeModal = () => {
      setSelectedBook(null);
      setEditingReferral(null);
      setIsConfirming(false);
  };


  const toggleSelectAll = () => {
      if (selectedReferralIds.size === filteredReferrals.length) {
          setSelectedReferralIds(new Set());
      } else {
          setSelectedReferralIds(new Set(filteredReferrals.map(r => r.id)));
      }
  };

  const toggleSelectOne = (id: string) => {
      const newSet = new Set(selectedReferralIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedReferralIds(newSet);
  };

  const handleExportCSV = () => {
      if (selectedReferralIds.size === 0) return;

      const headers = ["Book Title", "Author", "Target Branch", "Target Semester", "Date Referred"];
      const rows = myReferrals
        .filter(r => selectedReferralIds.has(r.id))
        .map(r => {
            const book = books.find(b => b.id === r.bookId);
            return [
                `"${book?.title || 'Unknown'}"`,
                `"${book?.author || 'Unknown'}"`,
                r.targetBranch,
                r.targetSemester,
                new Date(r.createdAt).toLocaleDateString()
            ].join(",");
        });

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `referrals_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-6 pb-6 border-b border-black dark:border-white">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div>
                <h1 className="text-4xl font-light tracking-tighter">Curriculum Planning</h1>
                <p className="text-zinc-500 mt-2">Browse inventory and refer materials to classes.</p>
            </div>
            
            {activeTab === 'inventory' && (
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search books..." 
                        className="w-full pl-10 pr-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white outline-none"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                    />
                </div>
            )}
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
            <button 
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'inventory' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
            >
                <Search size={16} /> Browse Inventory
            </button>
            <button 
                onClick={() => setActiveTab('referrals')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'referrals' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
            >
                <BookMarked size={16} /> Active Referrals ({myReferrals.length})
            </button>
        </div>
      </header>

      {activeTab === 'inventory' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredInventory.map(book => {
                const isLowStock = book.stock > 0 && book.stock < 3;
                return (
                    <div key={book.id} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors p-6 flex flex-col justify-between h-full">
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">{book.category}</span>
                            <h3 className="text-xl font-bold mt-1 leading-tight">{book.title}</h3>
                            <p className="text-zinc-500 text-sm mt-1">by {book.author}</p>
                        </div>
                        
                        <div className="mt-6 flex items-center justify-between border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-4">
                            <span className={`text-sm font-medium ${book.stock === 0 ? 'text-red-500' : isLowStock ? 'text-amber-600 flex items-center gap-1' : 'text-green-600'}`}>
                                {book.stock === 0 ? 'Out of Stock' : isLowStock ? <><AlertTriangle size={14} /> Low Stock ({book.stock})</> : `${book.stock} in stock`}
                            </span>
                            <button 
                                onClick={() => handleOpenReferralModal(book)}
                                className={`
                                    transition-colors px-4 py-2 text-sm font-semibold flex items-center gap-2
                                    ${book.stock === 0 
                                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600' 
                                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                                    }
                                `}
                            >
                                Refer <BookOpenCheck size={14} />
                            </button>
                        </div>
                    </div>
                );
            })}
          </div>
      ) : (
          <div className="animate-fade-in space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-zinc-50 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                     <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input 
                            placeholder="Filter by book title..." 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 outline-none focus:border-black dark:focus:border-white"
                            value={referralSearch}
                            onChange={(e) => setReferralSearch(e.target.value)}
                        />
                    </div>
                    <select 
                        className="p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 outline-none focus:border-black dark:focus:border-white text-sm"
                        value={referralBranchFilter}
                        onChange={(e) => setReferralBranchFilter(e.target.value as Branch | 'ALL')}
                    >
                        <option value="ALL">All Branches</option>
                        {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select 
                        className="p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 outline-none focus:border-black dark:focus:border-white text-sm"
                        value={referralSemFilter}
                        onChange={(e) => setReferralSemFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                    >
                        <option value="ALL">All Semesters</option>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                </div>

                <button 
                    onClick={handleExportCSV}
                    disabled={selectedReferralIds.size === 0}
                    className={`flex items-center gap-2 px-4 py-2 font-bold uppercase text-xs tracking-wider border transition-colors
                        ${selectedReferralIds.size > 0 
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white hover:opacity-80' 
                            : 'bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700 cursor-not-allowed'
                        }`}
                >
                    <Download size={14} /> Export Selected ({selectedReferralIds.size})
                </button>
            </div>

            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                {filteredReferrals.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                        No referrals match your filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-100 dark:bg-zinc-900 text-xs uppercase text-zinc-500">
                                    <th className="p-4 w-10">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedReferralIds.size === filteredReferrals.length && filteredReferrals.length > 0}
                                            onChange={toggleSelectAll}
                                            className="accent-black dark:accent-white"
                                        />
                                    </th>
                                    <th className="p-4">Book Details</th>
                                    <th className="p-4">Target Class</th>
                                    <th className="p-4">Referred On</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filteredReferrals.map(ref => {
                                    const book = books.find(b => b.id === ref.bookId);
                                    if (!book) return null;
                                    return (
                                        <tr key={ref.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                            <td className="p-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedReferralIds.has(ref.id)}
                                                    onChange={() => toggleSelectOne(ref.id)}
                                                    className="accent-black dark:accent-white"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold">{book.title}</div>
                                                <div className="text-xs text-zinc-500">{book.author}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-sm font-mono">
                                                    {ref.targetBranch} - Sem {ref.targetSemester}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-zinc-500">
                                                {new Date(ref.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleEditReferral(ref)}
                                                    className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full transition-colors"
                                                    title="Modify Assignment"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => handleDeleteReferral(e, ref.id)}
                                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                                                    title="Delete Referral"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
          </div>
      )}

      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md border border-black dark:border-white shadow-2xl p-6 relative flex flex-col transition-all duration-300">
                <button 
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white"
                >
                    <X size={20} />
                </button>

                {!isConfirming ? (
                    <>
                        <h2 className="text-2xl font-bold pr-8">
                            {editingReferral ? 'Modify Referral' : 'Refer Resource'}
                        </h2>
                        <div className="mt-2 mb-6 p-3 bg-zinc-50 dark:bg-zinc-800 border-l-2 border-black dark:border-white">
                            <p className="font-bold text-sm">{selectedBook.title}</p>
                            <p className="text-xs text-zinc-500">{selectedBook.author}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-1">Target Branch</label>
                                <select 
                                    className="w-full p-3 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 outline-none focus:border-black dark:focus:border-white"
                                    value={targetBranch}
                                    onChange={(e) => setTargetBranch(e.target.value as Branch)}
                                >
                                    {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-1">Target Semester</label>
                                <select 
                                    className="w-full p-3 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 outline-none focus:border-black dark:focus:border-white"
                                    value={targetSem}
                                    onChange={(e) => setTargetSem(parseInt(e.target.value))}
                                >
                                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>

                            <button 
                                onClick={handleReviewReferral}
                                className="w-full bg-black text-white dark:bg-white dark:text-black py-3 font-bold uppercase tracking-wider hover:opacity-90 mt-4 flex justify-center items-center gap-2"
                            >
                                Review Assignment <ArrowLeft size={16} className="rotate-180" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                         <h2 className="text-2xl font-bold pr-8">
                            Confirm Referral
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1">Please review the details below.</p>

                        <div className="my-6 space-y-4 border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-800/50">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-400">Resource</span>
                                <p className="font-bold">{selectedBook.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-zinc-400">Target Branch</span>
                                    <p className="font-mono text-sm">{targetBranch}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-zinc-400">Target Semester</span>
                                    <p className="font-mono text-sm">Semester {targetSem}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsConfirming(false)}
                                className="flex-1 py-3 font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleSaveReferral}
                                className="flex-[2] bg-black text-white dark:bg-white dark:text-black py-3 font-bold uppercase tracking-wider hover:opacity-90 text-xs flex items-center justify-center gap-2"
                            >
                                <Check size={16} /> Confirm & Save
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}
    </div>
  );
};